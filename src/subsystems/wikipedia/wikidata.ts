export type WikidataProperty = {
  mainsnak: {
    datavalue: {
      value: any;
    };
  };
};

export type WikidataSitelink = {
  site: string;
  title: string;
  url: string;
};

export type WikidataEntity = {
  claims: { [pid: string]: WikidataProperty[] };
  sitelinks: { [wiki: string]: WikidataSitelink };
};

export type WikidataResponse = {
  entities: { [qid: string]: WikidataEntity };
};

export const fetchWikidata = async (qid: string) => {
  const response = await fetch(
    `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json?flavor=simple`
  );
  return ((await response.json()) as WikidataResponse).entities[qid];
};

export const fetchBlurb = async (entity: WikidataEntity) => {
  const lang = navigator.language.split("-")[0];
  const langwiki = lang + "wiki";
  if (langwiki in entity.sitelinks) {
    const title = entity.sitelinks[langwiki].title;
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
    );
    const data = await response.json();
    return [data.extract, data.content_urls.desktop.page];
  } else {
    return [undefined, undefined];
  }
};
