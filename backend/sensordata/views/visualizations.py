from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from ..models import Visualization
from ..serializers import VisualizationSerializer
from .auth_base import AuthEnforcedModelViewSet


class VisualizationsViewSet(AuthEnforcedModelViewSet):
    queryset = Visualization.objects.all()
    serializer_class = VisualizationSerializer

    # permission_classes = [IsAuthenticated]

    # Delete visualization by name
    @action(detail=False, methods=["DELETE"])
    def delete_by_name(self, request):
        """Delete a visualization by its name."""

        visualization_name = request.query_params.get("name")
        if not visualization_name:
            return Response(
                {"message": "Visualization name must be provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            visualization = Visualization.objects.get(name=visualization_name)
            visualization.delete()
            return Response(
                {"message": "Visualization deleted successfully"},
                status=status.HTTP_200_OK,
            )
        except Visualization.DoesNotExist:
            return Response(
                {"message": "Visualization not found"}, status=status.HTTP_404_NOT_FOUND
            )
