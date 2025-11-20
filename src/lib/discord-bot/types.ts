export interface DiscordInteraction {
  id: string;
  type: InteractionType;
  data?: ApplicationCommandData;
  token: string;
  version: number;
}

export enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODAL_SUBMIT = 5,
}

export interface ApplicationCommandData {
  id: string;
  name: string;
  type: number;
  options?: ApplicationCommandOption[];
}

export interface ApplicationCommandOption {
  name: string;
  type: number;
  value?: string | number;
  options?: ApplicationCommandOption[];
}

export interface DiscordInteractionResponse {
  type: InteractionResponseType;
  data?: InteractionResponseData;
}

export enum InteractionResponseType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_UPDATE_MESSAGE = 6,
  UPDATE_MESSAGE = 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
  MODAL = 9,
}

export interface InteractionResponseData {
  content?: string;
  embeds?: DiscordEmbed[];
  components?: DiscordComponent[];
  flags?: number;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  footer?: DiscordEmbedFooter;
  timestamp?: string;
  url?: string;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedFooter {
  text: string;
}

export interface DiscordComponent {
  type: number;
  components: DiscordActionRowComponent[];
}

export interface DiscordActionRowComponent {
  type: number;
  style?: number;
  label?: string;
  url?: string;
  custom_id?: string;
}

export interface DiscordApplicationCommand {
  name: string;
  description: string;
  type?: number;
  options?: DiscordApplicationCommandOption[];
}

export interface DiscordApplicationCommandOption {
  name: string;
  description: string;
  type: number;
  required?: boolean;
  choices?: DiscordApplicationCommandOptionChoice[];
}

export interface DiscordApplicationCommandOptionChoice {
  name: string;
  value: string | number;
}

export enum ApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
  MENTIONABLE = 9,
  NUMBER = 10,
  ATTACHMENT = 11,
}
