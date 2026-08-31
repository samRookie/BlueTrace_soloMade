/**
 * Resource visibility classification.
 *
 * - `PUBLIC`: Accessible to any platform viewer without special clearances.
 * - `RESTRICTED`: Accessible only to authorized institutions, departments, or verified researchers.
 * - `INTERNAL`: Confined strictly to system administrators and internal governance operations.
 */
export type Visibility = 'PUBLIC' | 'RESTRICTED' | 'INTERNAL';
