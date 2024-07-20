export function sanitizeSnowflake(snowflake) {
    return snowflake.replace(/\D/g, '');
}
