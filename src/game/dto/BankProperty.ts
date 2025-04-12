export class BankProperty {
  name!: string;
  uri!: string;
  buyAmount!: number;
  rentAmount!: number;
  owner!: string;
  noOfUpgrades!: number;
  propertyType!: PropertyType;
  propertyColor!: PropertyColors;
}

export enum PropertyType {
  Property,
  RailStation,
  Utility,
  Special,
}

export enum PropertyColors {
  PINK,
  YELLOW,
  BLUE,
  ORANGE,
  RED,
  GREEN,
  PURPLE,
  BROWN,
}
