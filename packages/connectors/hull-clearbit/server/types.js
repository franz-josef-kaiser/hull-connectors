// @flow

import type { HullAttributeMapping } from "hull";

export type ShouldAction = {
  should: boolean,
  message?: string
};

export type ClearbitResult = {
  source: "enrich" | "reveal" | "prospect" | "discover",
  action: "success" | "error",
  message?: string
};

export type ClearbitProspect = {|
  id: string,
  domain?: string,
  name: {
    givenName: string,
    familyName: string,
    fullName: string
  },
  title: string,
  role: string,
  subRole: string,
  seniority: string,
  company: {
    name: string
  },
  email: string,
  verified: boolean,
  phone: string
|};

export type ClearbitPerson = {|
  id: string,
  name: {
    fullName: string,
    givenName: string,
    familyName: string
  },
  email: string,
  location: string,
  timeZone: string,
  utcOffset: number,
  geo: {
    city: string,
    state: string,
    stateCode: string,
    country: string,
    countryCode: string,
    lat: number,
    lng: number
  },
  bio: string,
  site: string,
  avatar: string,
  employment: {
    domain: string,
    name: string,
    title: string,
    role: string,
    subRole: string,
    seniority: string
  },
  facebook: {
    handle: string
  },
  github: {
    handle: string,
    avatar: string,
    company: string,
    blog: string,
    followers: number,
    following: number
  },
  twitter: {
    handle: string,
    id: string,
    bio: string,
    followers: number,
    following: number,
    location: string,
    site: string,
    avatar: string
  },
  linkedin: {
    handle: string
  },
  googleplus: {
    handle: ?string
  },
  gravatar: {
    handle: string,
    urls: Array<{
      value: string,
      title: string
    }>,
    avatar: string,
    avatars: Array<{
      url: string,
      type: string
    }>
  },
  fuzzy: boolean,
  emailProvider: boolean,
  indexedAt: string
|};

export type ClearbitCompany = {|
  id: string,
  name: string,
  legalName: string,
  domain: string,
  domainAliases: Array<string>,
  site: {
    phoneNumbers: Array<string>,
    emailAddresses: Array<string>
  },
  category: {
    sector: string,
    industryGroup: string,
    industry: string,
    subIndustry: string,
    sicCode: string,
    naicsCode: string
  },
  tags: Array<string>,
  description: string,
  foundedYear: number,
  location: string,
  timeZone: string,
  utcOffset: number,
  geo: {
    streetNumber: string,
    streetName: string,
    subPremise: ?string,
    city: string,
    postalCode: string,
    state: string,
    stateCode: string,
    country: string,
    countryCode: string,
    lat: number,
    lng: number
  },
  logo: string,
  facebook: {
    handle: string
  },
  linkedin: {
    handle: string
  },
  twitter: {
    handle: string,
    id: string,
    bio: string,
    followers: number,
    following: number,
    location: string,
    site: string,
    avatar: string
  },
  crunchbase: {
    handle: string
  },
  emailProvider: boolean,
  type: string,
  ticker: ?string,
  identifiers: {
    usEIN: string
  },
  phone: ?string,
  indexedAt: string,
  metrics: {
    alexaUsRank: number,
    alexaGlobalRank: number,
    employees: number,
    employeesRange: string,
    marketCap: ?string,
    raised: number,
    annualRevenue: ?string,
    estimatedAnnualRevenue: string,
    fiscalYearEnd: number
  },
  tech: Array<string>,
  parent: {
    domain: ?string
  },
  ultimate_parent: {
    domain: ?string
  }
|};

export type ClearbitCombined = {
  person: ClearbitPerson,
  company: ClearbitCompany
};

export type ClearbitRevealResponse = {
  ip: string,
  fuzzy: boolean,
  domain: string,
  type: "company",
  company: ClearbitCompany,
  geoIP: any
};

export type ClearbitProspectorResponse = {
  page: number,
  page_size: number,
  total: number,
  results: Array<ClearbitProspect>
};

export type ClearbitProspectorQuery = {
  titles: Array<string>,
  domain: string,
  roles: Array<string>,
  seniorities: Array<string>,
  cities?: Array<string>,
  states?: Array<string>,
  countries?: Array<string>,
  limit: number
};

export type ClearbitConnectorSettings = {
  api_key: string,

  incoming_prospect_mapping: HullAttributeMapping,
  incoming_person_mapping: HullAttributeMapping,
  incoming_company_mapping: HullAttributeMapping,

  enrich_user_segments: Array<string>,
  enrich_user_segments_exclusion: Array<string>,
  enrich_refresh: string,
  enrich_account_segments: Array<string>,
  enrich_account_segments_exclusion: Array<string>,

  discover_limit_count: number,
  discover_segments: Array<string>,

  prospect_account_segments: Array<string>,
  prospect_account_segments_exclusion: Array<string>,
  prospect_domain: string,
  prospect_filter_role: Array<string>,
  prospect_filter_seniority: Array<string>,
  prospect_filter_titles: Array<string>,
  prospect_limit_count: number,

  reveal_user_segments: Array<string>,
  reveal_user_segments_exclusion: Array<string>
};
