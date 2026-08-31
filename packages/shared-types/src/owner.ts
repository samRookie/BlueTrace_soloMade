/**
 * Principal type classification for resource owners.
 */
export type OwnerType = 'INDIVIDUAL' | 'ORGANIZATION' | 'INSTITUTION' | 'SYSTEM';

/**
 * Generic reference to an entity owner or creator.
 */
export interface OwnerReference {
  ownerId: string;
  ownerType: OwnerType;
  displayName?: string;
}
