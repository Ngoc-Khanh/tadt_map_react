import type { IBlock, IZone } from "@/data/interfaces";

export interface IGeometry {
  type: string;
  coordinates: [number, number, number][]; 
  properties: {
    name: string;
    description: string;
  }
}

export interface IZoneGeometry {
  geometry: IGeometry[];
}

export interface IZoneWithGeometry extends IZone {
  geometry: IGeometry[] | null;
}

export interface IBlockGeometry {
  geometry: IGeometry[];
}

export interface IBlockWithGeometry extends IBlock {
  geometry: IGeometry[] | null;
}