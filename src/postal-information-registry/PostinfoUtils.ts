const md5 = require('md5');

export default class PostinfoUtils {
  public static mapPostnamen(xmlPostnamen: any) {
    let postalNames = [];

    for (let postnaam of xmlPostnamen) {
      postalNames.push({
        "@value": postnaam.GeografischeNaam[0].Spelling[0],
        "@language": postnaam.GeografischeNaam[0].Taal[0],
      });
    }

    return postalNames;
  }

  public static mapStatus(status: string): string {
    switch (status.toLowerCase()) {
      case "gerealiseerd":
        return "https://data.vlaanderen.be/id/concept/binairestatus/gerealiseerd";

      case "gehistoreerd":
        return "https://data.vlaanderen.be/id/concept/binairestatus/gehistoreerd";

      default:
        throw new Error(
          `[PostInfoEventHandler]: version object must have a status.`
        );
    }
  }

  public static createObjectHash(postalInfoObject: any) {
    return md5(postalInfoObject);
  }

  public static getPostalInfoShape() {
    return [
      {
        "sh:path": "http://purl.org/dc/terms/isVersionOf",
        "sh:nodeKind": "sh:IRI",
        "sh:minCount": 1,
        "sh:maxCount": 1,
      },
      {
        "sh:path": "http://www.w3.org/ns/prov#generatedAtTime",
        "sh:datatype": "xsd:dateTime",
        "sh:minCount": 1,
        "sh:maxCount": 1,
      },
      {
        "sh:path": "http://www.w3.org/ns/adms#versionNotes",
        "sh:datatype": "xsd:string",
        "sh:minCount": 1,
        "sh:maxCount": 1,
      },
      {
        "sh:path": "https://data.vlaanderen.be/ns/adres#postcode",
        "sh:datatype": "xsd:integer",
        "sh:minCount": 1,
        "sh:maxCount": 1,
      },
      {
        "sh:path": "https://data.vlaanderen.be/ns/adres#postnaam",
        "sh:datatype": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
      },
    ];
  }

  public static getPostalInfoContext() {
    return {
      "@context": {
        xsd: "http://www.w3.org/2001/XMLSchema#",
        prov: "http://www.w3.org/ns/prov#",
        tree: "https://w3id.org/tree#",
        skos: "http://www.w3.org/2004/02/skos/core#",
        dct: "http://purl.org/dc/terms/",
        adms: "http://www.w3.org/ns/adms#",
        adres: "https://data.vlaanderen.be/ns/adres#",
        items: "@included",
        shacl: "@included",
        viewOf: {
          "@reverse": "tree:view",
          "@type": "@id",
        },
        memberOf: {
          "@reverse": "tree:member",
          "@type": "@id",
        },
        generatedAtTime: {
          "@id": "prov:generatedAtTime",
          "@type": "xsd:dateTime",
        },
        eventName: "adms:versionNotes",
        Postinfo: "adres:Postinfo",
        postcode: "adres:postcode",
        postnaam: "adres:postnaam",
        isVersionOf: {
          "@id": "dct:isVersionOf",
          "@type": "@id",
        },
        "tree:node": {
          "@type": "@id",
        },
        "tree:shape": {
          "@type": "@id",
        },
      },
    };
  }

  public static getPostalInfoShaclContext() {
    return {
      "@context": {
        sh: "https://www.w3.org/ns/shacl#",
        rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        tree: "https://w3id.org/tree#",
        skos: "http://www.w3.org/2004/02/skos/core#",
        prov: "http://www.w3.org/ns/prov#",
        dct: "http://purl.org/dc/terms/",
        adms: "http://www.w3.org/ns/adms#",
        adres: "https://data.vlaanderen.be/ns/adres#",
        shapeOf: {
          "@reverse": "tree:shape",
          "@type": "@id",
        },
        NodeShape: "sh:NodeShape",
        "sh:nodeKind": {
          "@type": "@id",
        },
        "sh:path": {
          "@type": "@id",
        },
        "sh:datatype": {
          "@type": "@id",
        },
      },
    };
  }
}