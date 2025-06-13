type CardType = 'location' | 'price' | 'provider' | 'drug' | 'plan';

export interface Card {
	title: string;
	type: CardType;
	description?: string;
}

export interface LocationCard extends Card {
	type: 'location';
	address: string;
	city: string;
	state: string;
	zip: string;
}

export interface PriceCard extends Card {
	type: 'price';
	price: number;
}

export type AnyCard = LocationCard | PriceCard | Card;

export interface CtaLink {
	label: string;
	url: string;
}

export interface MessageReply {
	message: string;
	cards?: Array<AnyCard>;
	cta?: CtaLink;
}
