import { Coin } from "../components/SpValidators/types";

export const COIN_DENOM = import.meta.env.VUE_APP_COIN_DENOM || "ELC";
export const COIN_DENOM_MIN =
  import.meta.env.VUE_APP_COIN_DENOM_MIN || "uelectra";
export const COIN_DENOM_MIN_DECIMAL = Number(
  import.meta.env.VUE_APP_COIN_DENOM_MIN_DECIMAL || "6"
);

export const getNativeTokenAmountFromBalances = (balances: Coin[]): number => {
  let i = balances.findIndex((bal) => bal.denom == COIN_DENOM_MIN);
  if (i == -1) {
    return 0;
  }
  return Number(balances[i].amount);
};

export const formatNativeToken = (amount: string | number): number => {
  return Number((Number(amount) / 10 ** COIN_DENOM_MIN_DECIMAL).toFixed(2));
};

export const toMinDenom = (amount: number | string): number => {
  return Number(amount) * 10 ** COIN_DENOM_MIN_DECIMAL;
};

// export default {
//     getNativeTokenAmountFromBalances
// };
