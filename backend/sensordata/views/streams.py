from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from ..models import Stream
from ..serializers import StreamSerializer
from .auth_base import AuthEnforcedModelViewSet


class StreamsViewSet(AuthEnforcedModelViewSet):
    queryset = Stream.objects.all()
    serializer_class = StreamSerializer

    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Stream.objects.all()
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

        if is_many:
            response = {
                "message": "Streams created successfully",
                "streams": serializer.data,
            }
        else:
            response = {
                "message": "Stream created successfully",
                "stream": serializer.data,
            }
        return Response(response, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset:
            return Response(
                {"message": "No streams found"}, status=status.HTTP_404_NOT_FOUND
            )

        if self.request.query_params.get("name", None):
            serializer = StreamSerializer(queryset, many=True)
            return Response({"streams": serializer.data})
        serializer = StreamSerializer(queryset, many=True)
        return Response({"streams": serializer.data})

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
