/**
 * CommissionRates defines the initial commission rates to be used for creating
 * a validator.
 */
export interface CommissionRates {
  /** rate is the commission rate charged to delegators, as a fraction. */
  rate: string;
  /** max_rate defines the maximum commission rate which validator can ever charge, as a fraction. */
  max_rate: string;
  /** max_change_rate defines the maximum daily increase of the validator commission, as a fraction. */
  max_change_rate: string;
}

/** Commission defines commission parameters for a given validator. */
export interface Commission {
  /** commission_rates defines the initial commission rates to be used for creating a validator. */
  commission_rates: CommissionRates | undefined;
  /** update_time is the last time the commission rate was changed. */
  update_time: Date | undefined;
}
export enum BondStatus {
  /** BOND_STATUS_UNSPECIFIED - UNSPECIFIED defines an invalid validator status. */
  BOND_STATUS_UNSPECIFIED = 0,
  /** BOND_STATUS_UNBONDED - UNBONDED defines a validator that is not bonded. */
  BOND_STATUS_UNBONDED = 1,
  /** BOND_STATUS_UNBONDING - UNBONDING defines a validator that is unbonding. */
  BOND_STATUS_UNBONDING = 2,
  /** BOND_STATUS_BONDED - BONDED defines a validator that is bonded. */
  BOND_STATUS_BONDED = 3,
  UNRECOGNIZED = -1,
}
/** Description defines a validator description. */
export interface Description {
  /** moniker defines a human-readable name for the validator. */
  moniker: string;
  /** identity defines an optional identity signature (ex. UPort or Keybase). */
  identity: string;
  /** website defines an optional website link. */
  website: string;
  /** security_contact defines an optional email for security contact. */
  security_contact: string;
  /** details define other optional details. */
  details: string;
}

export interface Validator {
  /** operator_address defines the address of the validator's operator; bech encoded in JSON. */
  operator_address: string;
  /** consensus_pubkey is the consensus public key of the validator, as a Protobuf Any. */
  consensus_pubkey: undefined;
  /** jailed defined whether the validator has been jailed from bonded status or not. */
  jailed: boolean;
  /** status is the validator status (bonded/unbonding/unbonded). */
  status: BondStatus;
  /** tokens define the delegated tokens (incl. self-delegation). */
  tokens: string;
  /** delegator_shares defines total shares issued to a validator's delegators. */
  delegator_shares: string;
  /** description defines the description terms for the validator. */
  description: Description | undefined;
  /** unbonding_height defines, if unbonding, the height at which this validator has begun unbonding. */
  unbonding_height: number;
  /** unbonding_time defines, if unbonding, the min time for the validator to complete unbonding. */
  unbonding_time: Date | undefined;
  /** commission defines the commission parameters. */
  commission: Commission | undefined;
  /** min_self_delegation is the validator's self declared minimum self delegation. */
  min_self_delegation: string;
}

/**
 * Coin defines a token with a denomination and an amount.
 *
 * NOTE: The amount field is an Int which implements the custom method
 * signatures required by gogoproto.
 */
export interface Coin {
  denom: string;
  amount: string;
}

export interface DecCoin {
  denom: string;
  amount: string;
}

export interface PageResponse {
  next_key: Uint8Array;
  total: number;
}

export interface QueryAllBalancesResponse {
  balances: Coin[];
  pagination: PageResponse | undefined;
}

/**
 * Delegation Response
 */

export interface Delegation {
  delegator_address: string;
  validator_address: string;
  shares: string;
}

export interface DelegationResponse {
  delegation?: Delegation;
  balance?: Coin;
}

export interface QueryValidatorDelegationsResponse {
  delegation_responses: DelegationResponse[];
  pagination?: PageResponse;
}

/**
 * Rewards Query Response
 */

export interface QueryDelegationTotalRewardsResponse {
  /** rewards defines all the rewards accrued by a delegator. */
  rewards: DelegationDelegatorReward[];
  /** total defines the sum of all the rewards. */
  total: DecCoin[];
}

export interface DelegationDelegatorReward {
  validator_address: string;
  reward: DecCoin[];
}

/**
 * Unbonding Query Response
 */

export interface QueryDelegatorUnbondingDelegationsResponse {
  unbonding_responses: UnbondingDelegation[];
  pagination: PageResponse | undefined;
}

export interface UnbondingDelegation {
  delegator_address: string;
  validator_address: string;
  entries: UnbondingDelegationEntry[];
}

export interface UnbondingDelegationEntry {
  creation_height: number;
  completion_time?: Date;
  initial_balance: string;
  balance: string;
}
