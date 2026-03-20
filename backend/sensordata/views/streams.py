from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.db import transaction
from ..models import Stream
from ..serializers import StreamSerializer
from .auth_base import AuthEnforcedModelViewSet
from ..utils.pagination import parse_limit_offset, apply_limit_offset


class StreamsViewSet(AuthEnforcedModelViewSet):
    queryset = Stream.objects.all()
    serializer_class = StreamSerializer

    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Stream.objects.all().order_by("id")
        name_filter = self.request.query_params.get("name", None)
        sensor_filter = self.request.query_params.get("sensor", None)

        if name_filter:
            queryset = queryset.filter(name=name_filter)

        if sensor_filter:
            queryset = queryset.filter(sensor=sensor_filter)

        return queryset

    def create(self, request, *args, **kwargs):
        """Create new stream."""
        payload = request.data
        is_many = isinstance(payload, list)

        if is_many and not payload:
            return Response(
                {"message": "At least one stream payload is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = StreamSerializer(data=payload, many=is_many)
        if not serializer.is_valid():
            response = {"message": serializer.errors}
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            serializer.save()

        serialized_data = serializer.data
        streams_payload = serialized_data if is_many else [serialized_data]
        message = (
            "Streams created successfully" if is_many else "Stream created successfully"
        )

        response = {
            "message": message,
            "streams": streams_payload,
            "count": len(streams_payload),
        }
        return Response(response, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        total_count = queryset.count()
        if total_count == 0:
            return Response(
                {"message": "No streams found"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            limit, offset = parse_limit_offset(request.query_params, default_limit=20)
        except ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)

        paginated_queryset = apply_limit_offset(queryset, limit, offset)
        serializer = StreamSerializer(paginated_queryset, many=True)
        return Response(
            {
                "streams": serializer.data,
                "pagination": {
                    "count": total_count,
                    "limit": limit,
                    "offset": offset,
                    "returned": len(serializer.data),
                },
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            stream_id = instance.id
            instance.delete()
            response = {"message": f"Stream {stream_id} deleted successfully"}
            return Response(response, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            response = {"message": e}
            return Response(response, status=status.HTTP_400_BAD_REQUEST)
