"use client";

import { useState, useCallback, useRef } from "react";

export interface BrandFormState {
  // Core
  name: string;
  defaultLogo: string;
  website: string;
  yearEstablished: string;
  ownerOperator: string;

  // Payment
  currencies: string[];
  paymentMethods: string[];
  minDeposit: string;
  minWithdrawal: string;
  maxWithdrawal: string;
  withdrawalTime: string;

  // Games
  gameTypes: string[];
  gameProviders: string[];
  totalGames: string;
  exclusiveGames: string;

  // Geo & Languages
  languages: string[];
  availableCountries: string[];
  restrictedCountries: string[];
  supportLanguages: string[];

  // Booleans
  sportsBetting: string;
  cryptoCasino: string;
  vpnAllowed: string;
  kycRequired: string;

  // Other
  supportContacts: string;
  supportHours: string;
  license: string;
  mobileCompatibility: string;
  registrationProcess: string;
  kycProcess: string;
}

const INITIAL_STATE: BrandFormState = {
  name: "",
  defaultLogo: "",
  website: "",
  yearEstablished: "",
  ownerOperator: "",
  currencies: [],
  paymentMethods: [],
  minDeposit: "",
  minWithdrawal: "",
  maxWithdrawal: "",
  withdrawalTime: "",
  gameTypes: [],
  gameProviders: [],
  totalGames: "",
  exclusiveGames: "",
  languages: [],
  availableCountries: [],
  restrictedCountries: [],
  supportLanguages: [],
  sportsBetting: "",
  cryptoCasino: "",
  vpnAllowed: "",
  kycRequired: "",
  supportContacts: "",
  supportHours: "",
  license: "",
  mobileCompatibility: "",
  registrationProcess: "",
  kycProcess: "",
};

function asArr(val: unknown): string[] {
  return Array.isArray(val) ? val : [];
}

function asStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

export interface BrandApiData {
  brandId: string;
  name: string;
  defaultLogo: string | null;
  website: string | null;
  license: string | null;
  yearEstablished: number | null;
  ownerOperator: string | null;
  languages: string[] | null;
  availableCountries: string[] | null;
  restrictedCountries: string[] | null;
  currencies: string[] | null;
  paymentMethods: string[] | null;
  withdrawalTime: string | null;
  minDeposit: string | null;
  minWithdrawal: string | null;
  maxWithdrawal: string | null;
  sportsBetting: boolean | null;
  cryptoCasino: boolean | null;
  vpnAllowed: boolean | null;
  kycRequired: boolean | null;
  gameProviders: string[] | null;
  totalGames: number | null;
  gameTypes: string[] | null;
  exclusiveGames: string | null;
  supportContacts: string | null;
  supportHours: string | null;
  supportLanguages: string[] | null;
  mobileCompatibility: string | null;
  registrationProcess: string | null;
  kycProcess: string | null;
}

function apiToFormState(brand: BrandApiData): BrandFormState {
  return {
    name: asStr(brand.name),
    defaultLogo: asStr(brand.defaultLogo),
    website: asStr(brand.website),
    yearEstablished: brand.yearEstablished != null ? String(brand.yearEstablished) : "",
    ownerOperator: asStr(brand.ownerOperator),
    sportsBetting: brand.sportsBetting === true ? "yes" : brand.sportsBetting === false ? "no" : "",
    cryptoCasino: brand.cryptoCasino === true ? "yes" : brand.cryptoCasino === false ? "no" : "",
    vpnAllowed: brand.vpnAllowed === true ? "yes" : brand.vpnAllowed === false ? "no" : "",
    kycRequired: brand.kycRequired === true ? "yes" : brand.kycRequired === false ? "no" : "",
    currencies: asArr(brand.currencies),
    paymentMethods: asArr(brand.paymentMethods),
    minDeposit: asStr(brand.minDeposit),
    minWithdrawal: asStr(brand.minWithdrawal),
    maxWithdrawal: asStr(brand.maxWithdrawal),
    withdrawalTime: asStr(brand.withdrawalTime),
    gameTypes: asArr(brand.gameTypes),
    gameProviders: asArr(brand.gameProviders),
    totalGames: brand.totalGames != null ? String(brand.totalGames) : "",
    exclusiveGames: asStr(brand.exclusiveGames),
    languages: asArr(brand.languages),
    availableCountries: asArr(brand.availableCountries),
    restrictedCountries: asArr(brand.restrictedCountries),
    supportLanguages: asArr(brand.supportLanguages),
    supportContacts: asStr(brand.supportContacts),
    supportHours: asStr(brand.supportHours),
    license: asStr(brand.license),
    mobileCompatibility: asStr(brand.mobileCompatibility),
    registrationProcess: asStr(brand.registrationProcess),
    kycProcess: asStr(brand.kycProcess),
  };
}

export function useBrandForm() {
  const [state, setState] = useState<BrandFormState>(INITIAL_STATE);
  const savedRef = useRef<string>("");

  const updateField = useCallback(
    <K extends keyof BrandFormState>(field: K, value: BrandFormState[K]) => {
      setState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const loadBrand = useCallback((brand: BrandApiData) => {
    const formState = apiToFormState(brand);
    setState(formState);
    savedRef.current = JSON.stringify(formState);
  }, []);

  const resetForm = useCallback(() => {
    if (savedRef.current) {
      setState(JSON.parse(savedRef.current));
    } else {
      setState(INITIAL_STATE);
    }
  }, []);

  const hasChanges = JSON.stringify(state) !== savedRef.current;

  const markSaved = useCallback(() => {
    savedRef.current = JSON.stringify(state);
  }, [state]);

  function getSubmitPayload(): Record<string, unknown> {
    const nullIfEmpty = (val: string) => val || null;
    const arrOrNull = (val: string[]) => (val.length > 0 ? val : null);
    const intOrNull = (val: string) => (val ? parseInt(val, 10) : null);

    return {
      name: state.name,
      defaultLogo: nullIfEmpty(state.defaultLogo),
      website: nullIfEmpty(state.website),
      yearEstablished: intOrNull(state.yearEstablished),
      ownerOperator: nullIfEmpty(state.ownerOperator),
      sportsBetting:
        state.sportsBetting === "yes" ? true : state.sportsBetting === "no" ? false : null,
      cryptoCasino:
        state.cryptoCasino === "yes" ? true : state.cryptoCasino === "no" ? false : null,
      vpnAllowed:
        state.vpnAllowed === "yes" ? true : state.vpnAllowed === "no" ? false : null,
      kycRequired:
        state.kycRequired === "yes" ? true : state.kycRequired === "no" ? false : null,
      currencies: arrOrNull(state.currencies),
      paymentMethods: arrOrNull(state.paymentMethods),
      minDeposit: nullIfEmpty(state.minDeposit),
      minWithdrawal: nullIfEmpty(state.minWithdrawal),
      maxWithdrawal: nullIfEmpty(state.maxWithdrawal),
      withdrawalTime: nullIfEmpty(state.withdrawalTime),
      gameTypes: arrOrNull(state.gameTypes),
      gameProviders: arrOrNull(state.gameProviders),
      totalGames: intOrNull(state.totalGames),
      exclusiveGames: nullIfEmpty(state.exclusiveGames),
      languages: arrOrNull(state.languages),
      availableCountries: arrOrNull(state.availableCountries),
      restrictedCountries: arrOrNull(state.restrictedCountries),
      supportLanguages: arrOrNull(state.supportLanguages),
      supportContacts: nullIfEmpty(state.supportContacts),
      supportHours: nullIfEmpty(state.supportHours),
      license: nullIfEmpty(state.license),
      mobileCompatibility: nullIfEmpty(state.mobileCompatibility),
      registrationProcess: nullIfEmpty(state.registrationProcess),
      kycProcess: nullIfEmpty(state.kycProcess),
    };
  }

  return { state, updateField, loadBrand, resetForm, hasChanges, markSaved, getSubmitPayload };
}
