import { gql, request } from 'graphql-request'
const query = gql`{
 list
}`

const url = 'https://api.studio.thegraph.com/query/102654/listing/version/latest'
async function fetchSubgraphData() {
  return await request(url, query)
}
fetchSubgraphData().then((data) => console.log({data})).catch(console.error)