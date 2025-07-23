import type { IBlock, IProjectDetail, IZone } from "@/data/interfaces";

export interface IPlanningArea extends IProjectDetail {
  zones: IZonePlanningArea[];
}

export interface IGeometryJSON {
  type: string;
  coordinates: number[][];
}

export interface IZonePlanningArea extends IZone {
  geom: IGeometryJSON;
  blocks: IBlockPlanningArea[];
}

export interface IBlockPlanningArea extends IBlock {
  block_name: string;
  geom: IGeometryJSON;
}