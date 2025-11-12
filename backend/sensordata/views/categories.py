from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from ..models import Category, ParameterCategory
from ..serializers import CategorySerializer
from .auth_base import AuthEnforcedModelViewSet


class CategoriesViewSet(AuthEnforcedModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_queryset(self):
        queryset = Category.objects.all()

        if getattr(self, "action", None) == "list":
            name_filter = self.request.query_params.get("name")
            if name_filter:
                queryset = queryset.filter(name=name_filter)

        return queryset

    # Serialize listing of categories
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        # Check if queryset is empty
        if not queryset.exists():
            return Response(
                {"message": "No categories found"}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = CategorySerializer(queryset, many=True)
        return Response({"categories": serializer.data})

    def destroy(self, request, *args, **kwargs):
        # Check if user is authenticated
        self.permission_classes = [IsAuthenticated]
        self.check_permissions(request)

        instance = self.get_object()
        # Check if parameter is mapped to a category
        if ParameterCategory.objects.filter(category=instance).exists():
            # Delete the mapping
            ParameterCategory.objects.filter(category=instance).delete()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
