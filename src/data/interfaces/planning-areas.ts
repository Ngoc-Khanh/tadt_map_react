import type { IBlock, IProjectDetail, IZone } from "@/data/interfaces";

export interface IPlanningArea extends IProjectDetail {
  zones: IZonePlanningArea[];
}

export interface IZonePlanningArea extends IZone {
  geom: string;
  blocks: IBlockPlanningArea[];
}

export interface IBlockPlanningArea extends IBlock {
  blocks: IBlockPlanningArea[];
  geom: string;
}