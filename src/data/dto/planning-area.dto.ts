export type SavePlanningAreaDto = {
  project_id: string;
  zone_id: string;
  block_id?: string;
  block_name: string;
  block_geom: string;
};

export type SavePlanningAreaZoneDto = {
  project_id: string;
  zone_id: string;
  zone_geom: string;
}