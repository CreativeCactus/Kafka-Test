const fs = require('fs')
const request = require('request')
var stream = require('stream')

var stringer = new stream.Transform( { objectMode: true } )

stringer._transform = function (chunk, encoding, done) {
    // this.push(JSON.stringify(chunk.value))
    this.push(chunk.value+'\r\n')
}

const kafka = require('kafka-node')
const client = new kafka.KafkaClient({kafkaHost: '127.0.0.1:9092'});
// const client2 = new kafka.KafkaClient({kafkaHost: '127.0.0.1:9092'});
// const client3 = new kafka.KafkaClient({kafkaHost: '127.0.0.1:9092'});
// const client4 = new kafka.KafkaClient({kafkaHost: '127.0.0.1:9092'});
// client.refreshMetadata() 

// const admin = new kafka.Admin(client);
const producer = new kafka.Producer(client);

function doRequest(options) {
    return new Promise ((resolve, reject) => {
        let req = request(options,(err,res,body)=>{
            try{
                if(err)reject(err)
                resolve(JSON.parse(body))
            } catch(e){
                console.dir(e)
            }
        });
    }); 
}

// Admin

// const topics = [{
//     topic: 'beer',
//     partitions: 1,
//     replicationFactor: 1
// },{
//     topic: 'SomeRandomTopicToDemonstrateThatICanAddMoreAtRuntime',
//     partitions: 1,
//     replicationFactor: 1
// }];
const topics = ['beer']


// Producer(s)

producer.on('ready', async function () {
    producer.createTopics(topics, async (err, res) => {
        if(err) throw err
        console.log(`Created topics: ${res}`)

        startConsumers()


        for ( let i = 1; i < 100; i++ ) {
            const options = {url:`https://api.punkapi.com/v2/beers?page=${i}`}

            const data = await doRequest(options)
            if(data.length == 0) break;

            console.log('Producer is sending some data...')
            producer.send([{
                topic: 'beer',
                messages: data.map(v => JSON.stringify(v))
            }], function (err, res) {
                console.dir({err, res});
            });

        }

    });


})

function startConsumers(){
    // Consumer A

    consumerA = new kafka.Consumer(client,[
        {topic:'beer'}
    ],{
        groupId: 'A',
        autoCommit: false
    });

    // consumerA.addTopics([{ topic: 'beer', offset: 10 }], function (err, added) {
    //     console.log(`ConsumerA is listening to beer from offset 10...`)
    // }, true);

    consumerA.on('message', msg => {console.log(`Consumer A got message of type: ${typeof msg.value}`)});

    // Consumer B

    consumerB = new kafka.ConsumerStream(client,[{topic:'beer'}],{
        groupId: 'B',
        autoCommit: false
    });

    consumerB.pipe(stringer).pipe(fs.createWriteStream('/tmp/kafka.data'))

}
