from ..models import Category
from ..serializers import CategorySerializer
from .auth_base import AuthEnforcedModelViewSet


class CategoriesViewSet(AuthEnforcedModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
