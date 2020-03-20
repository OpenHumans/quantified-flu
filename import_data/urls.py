from django.urls import path

from .views import complete_fitbit, remove_fitbit, update_fitbit


app_name = "import_data"

urlpatterns = [
    path("complete-fitbit/", complete_fitbit, name="complete-fitbit"),
    path("remove-fitbit/", remove_fitbit, name="remove-fitbit"),
    path("update-fitbit/", update_fitbit, name="update-fitbit"),
]
