from django.urls import path

from .views import complete_fitbit, remove_fitbit, update_fitbit
from .views import authorize_oura, complete_oura, remove_oura, update_oura


app_name = "import_data"

urlpatterns = [
    path("complete-fitbit/", complete_fitbit, name="complete-fitbit"),
    path("remove-fitbit/", remove_fitbit, name="remove-fitbit"),
    path("update-fitbit/", update_fitbit, name="update-fitbit"),
    path("authorize-oura/", authorize_oura, name="authorize-oura"),
    path("complete-oura/", complete_oura, name="complete-oura"),
    path("remove-oura/", remove_oura, name="remove-oura"),
    path("update-oura/", update_oura, name="update-oura"),
]
