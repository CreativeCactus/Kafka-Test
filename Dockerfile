FROM nodejs
COPY ./package* ./
RUN npm i
COPY ./ ./
CMD node producer.js