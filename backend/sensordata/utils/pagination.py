from rest_framework.exceptions import ValidationError


def parse_limit_offset(query_params, default_limit, default_offset=0):
    """
    Parse limit/offset query params with endpoint-specific defaults.

    Returns:
        tuple[int, int]: (limit, offset)
    """
    raw_limit = query_params.get("limit", default_limit)
    raw_offset = query_params.get("offset", default_offset)

    try:
        limit = int(raw_limit)
    except (TypeError, ValueError):
        raise ValidationError({"message": "limit must be an integer"})

    try:
        offset = int(raw_offset)
    except (TypeError, ValueError):
        raise ValidationError({"message": "offset must be an integer"})

    if offset < 0:
        raise ValidationError({"message": "offset must be greater than or equal to 0"})

    # If limit is negative, return the full dataset and ignore offset.
    if limit < 0:
        return limit, 0

    return limit, offset


def apply_limit_offset(queryset, limit, offset):
    """Apply limit/offset to queryset. Negative limit means no limit."""
    if limit < 0:
        return queryset

    return queryset[offset: offset + limit]
