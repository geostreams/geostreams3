import re

from drf_yasg.inspectors import SwaggerAutoSchema


class GroupedTagsAutoSchema(SwaggerAutoSchema):
    """
    Group swagger operations by resource name.

    For DRF ViewSets we use router basename (categories, sensors, streams, etc.),
    which avoids collapsing all operations under a shared path prefix like /data/.
    """

    def get_tags(self, operation_keys=None):
        explicit_tags = self.overrides.get("tags")
        if explicit_tags:
            return explicit_tags

        basename = getattr(self.view, "basename", None)
        if basename:
            label = basename.replace("-", " ").replace("_", " ").strip()
            return [label.title()]

        class_name = self.view.__class__.__name__
        if class_name.endswith("ViewSet"):
            class_name = class_name[: -len("ViewSet")]
        elif class_name.endswith("View"):
            class_name = class_name[: -len("View")]

        humanized = re.sub(r"(?<!^)(?=[A-Z])", " ", class_name).strip()
        return [humanized or "API"]
