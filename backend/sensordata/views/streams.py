from rest_framework.response import Response
from rest_framework import status
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

        if name_filter:
            queryset = queryset.filter(name=name_filter)

        return queryset

    def create(self, request, *args, **kwargs):
        """Create new stream."""
        serializer = StreamSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        response = {"message": serializer.errors}
        return Response(response, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset:
            return Response(
                {"message": "No streams found"}, status=status.HTTP_404_NOT_FOUND
            )

        if self.request.query_params.get("name", None):
            serializer = StreamSerializer(queryset[0])
            return Response({"stream": serializer.data})
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
