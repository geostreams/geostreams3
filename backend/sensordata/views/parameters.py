from rest_framework.response import Response
from rest_framework import status
from ..models import Parameter, Category, ParameterCategory, Visualization
from ..serializers import (
    ParameterSerializer,
    CategorySerializer,
    ParameterCategorySerializer,
)
from rest_framework.permissions import IsAuthenticated
from .auth_base import AuthEnforcedModelViewSet


class ParametersViewSet(AuthEnforcedModelViewSet):
    queryset = Parameter.objects.all()
    serializer_class = ParameterSerializer

    # Overwrite get queryset to allow filtering by name
    def get_queryset(self):
        queryset = Parameter.objects.all()
        name_filter = self.request.query_params.get("name", None)

        if name_filter:
            queryset = queryset.filter(name=name_filter)

        return queryset

    # Serialize listing of parameters
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        # Check if queryset is empty
        if not queryset:
            return Response(
                {"message": "No parameters found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if name query parameter is provided and return only that parameter
        # and its mappings and categories
        if self.request.query_params.get("name", None):
            param_serializer = ParameterSerializer(queryset[0])
            mapping_serialized = ParameterCategorySerializer(
                ParameterCategory.objects.filter(parameter=queryset[0]), many=True
            )
            category_serialized = CategorySerializer(
                Category.objects.filter(
                    id__in=[
                        param_category.category.id
                        for param_category in ParameterCategory.objects.filter(
                            parameter=queryset[0]
                        )
                    ]
                ),
                many=True,
            )

            return Response(
                {
                    "parameter": param_serializer.data,
                    "mappings": mapping_serialized.data,
                    "categories": category_serialized.data,
                }
            )

        param_serializer = ParameterSerializer(queryset, many=True)
        category_serialized = CategorySerializer(Category.objects.all(), many=True)
        mapping_serialized = ParameterCategorySerializer(
            ParameterCategory.objects.all(), many=True
        )
        return Response(
            {
                "parameters": param_serializer.data,
                "categories": category_serialized.data,
                "mappings": mapping_serialized.data,
            }
        )

    # Overwrite create to allow adding visualization by name
    def create(self, request, *args, **kwargs):
        """Create a Parameter with Visualization and Category names."""
        visualization_name = request.data.get("visualization")
        category_name = request.data.get("category")
        parameter_data = request.data.copy()

        # Check for Visualization existence
        if visualization_name:
            try:
                visualization = Visualization.objects.get(name=visualization_name)
            except Visualization.DoesNotExist:
                return Response(
                    {"message": "Visualization does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(
                {"message": "Visualization must be provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check for Category existence
        if category_name:
            try:
                category = Category.objects.get(name=category_name)
            except Category.DoesNotExist:
                return Response(
                    {"message": "Category does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(
                {"message": "Category must be provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Now that we have ensured both Visualization and Category
        # exist, proceed with Parameter creation
        serializer = self.get_serializer(data=parameter_data)
        serializer.is_valid(raise_exception=True)
        parameter = serializer.save(visualization=visualization)

        # Since category_name is provided and exists, link Parameter and Category
        ParameterCategory.objects.create(parameter=parameter, category=category)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update a Parameter, and optionally its Visualization and Category, by name"""
        instance = self.get_object()
        visualization_name = request.data.get("visualization")
        category_name = request.data.get("category")
        parameter_data = request.data.copy()

        if visualization_name:
            try:
                visualization = Visualization.objects.get(name=visualization_name)
                parameter_data.pop("visualization")
                instance.visualization = visualization
            except Visualization.DoesNotExist:
                return Response(
                    {"message": "Visualization does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Check if category is provided
        if category_name:
            try:
                category = Category.objects.get(name=category_name)
                # Check if parameter is already mapped to a category
                if ParameterCategory.objects.filter(
                    parameter=self.get_object()
                ).exists():
                    # Update the mapping
                    ParameterCategory.objects.filter(
                        parameter=self.get_object()
                    ).update(category=category)
            except Category.DoesNotExist:
                return Response(
                    {"message": "Category does not exist"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        partial = kwargs.pop("partial", True)
        serializer = self.get_serializer(instance, data=parameter_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        # Check if user is authenticated
        self.permission_classes = [IsAuthenticated]
        self.check_permissions(request)

        instance = self.get_object()
        # Check if parameter is mapped to a category
        if ParameterCategory.objects.filter(parameter=instance).exists():
            # Delete the mapping
            ParameterCategory.objects.filter(parameter=instance).delete()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
