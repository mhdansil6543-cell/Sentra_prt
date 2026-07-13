from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "status": "success",
        "message": "Sentra API is running successfully 🚀",
        "documentation": "/api/schema/swagger-ui/",
    })