import { db } from '../utils/DatabaseQueries';
import { configuration } from '../utils/Configuration';
import { addNext, addPrevious } from '../utils/HypermediaControls';
import { addHeaders } from '../utils/Headers';
import AdresUtils from './AdresUtils';

const ADDRESS_PAGE_BASE_URL = `${configuration.domainName}/adres`;
const ADDRESS_SHACL_BASE_URL = `${configuration.domainName}/adres/shacl`;
const PAGE_SIZE = 250;


// Get all events for all addresses
export async function getAddressPage(req, res) {
  const page = parseInt(req.query.page, 10);

  if (!page) {
    res.redirect('?page=1');
  } else {
    const queryResponse = await db.getAddressesPaged(page, PAGE_SIZE);
    addHeaders(res, PAGE_SIZE, queryResponse.rows.length);
    res.json(buildAddressPageResponse(queryResponse.rows, PAGE_SIZE, page));
  }
}

// Get SHACL shape for address objects
export function getAddressShape(req, res) {
  res.json(buildAddressShaclResponse());
}

function buildAddressPageResponse(items: any[], pageSize: number, page: number) {
  const response = AdresUtils.getAddressContext();

  response['@id'] = `${ADDRESS_PAGE_BASE_URL}?page=${page}`;
  response['viewOf'] = `${ADDRESS_PAGE_BASE_URL}`;

  const tree = [];

  addNext( tree, items.length, pageSize, page, ADDRESS_PAGE_BASE_URL);
  addPrevious( tree, items.length, page, ADDRESS_PAGE_BASE_URL);

  if (tree.length) {
    response['tree:relation'] = tree;
  }

  response['shacl'] = {
    '@id' : ADDRESS_PAGE_BASE_URL,
    'tree:shape' : ADDRESS_SHACL_BASE_URL
  };

  response['items'] = items.map(item => createAddressEvent(item));

  return response;
}

function buildAddressShaclResponse(){
  const response = AdresUtils.getAddressShaclContext();

  response['@id'] = ADDRESS_SHACL_BASE_URL;
  response['@type'] = "NodeShape";
  response['shapeOf'] = ADDRESS_PAGE_BASE_URL;
  response['sh:property'] = AdresUtils.getAddressShape();

  return response;
}

function createAddressEvent(data) {
  const addressEvent = {};

  const hash = AdresUtils.createObjectHash(data);

  addressEvent['@id'] = `${ADDRESS_PAGE_BASE_URL}#${hash}`;
  addressEvent['isVersionOf'] = data.object_uri;
  addressEvent['generatedAtTime'] = data.timestamp;
  addressEvent['eventName'] = data.event_name;
  addressEvent['memberOf'] = ADDRESS_PAGE_BASE_URL;

  addressEvent['@type'] = 'Adres';

  if (data.box_number) {
    addressEvent['busnummer'] = data.box_number
  }

  if (data.house_number) {
    addressEvent['huisnummer'] = data.house_number;
  }

  addressEvent['heeftStreetnaam'] = data.streetname_puri;
  addressEvent['heeftGemeentenaam'] = {
    "@type" : "Gemeentenaam",
    "gemeentenaam" : JSON.parse(data.municipality_name),
    "isAfgeleidVan" : data.municipality_puri
  }

  if (data.postal_code) {
    addressEvent['heeftPostinfo'] = {
      "@type" : "Postinfo",
      'postcode': data.postal_code
    }
  }

  addressEvent['isToegekendDoor'] = data.municipality_puri;

  addressEvent['positie'] = {
    '@type': 'GeografischePositie',
    'default' : true,
    'geometrie': {
      '@type': 'Punt',
      'gml' : data.address_geometry
    },
    'methode' : data.position_geometry_method,
    'specificatie' : data.position_specification
  }

  addressEvent['officieelToegekend'] = data.officially_assigned;
  addressEvent['status'] = data.address_status;

  return addressEvent;
}
