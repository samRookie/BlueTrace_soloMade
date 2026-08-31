/**
 * Semantic contract for identifying sample, non-production, or synthetic demonstration records.
 *
 * `sampleFlag: true` identifies records created for illustrative or demo purposes,
 * ensuring they are never conflated with authoritative, verified evidence.
 */
export interface WithSampleFlag {
  sampleFlag: boolean;
}
