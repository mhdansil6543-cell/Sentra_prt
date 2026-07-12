from rest_framework.response import Response


class ApiResponse:
    """
    Standard API response helper.
    """

    @staticmethod
    def success(
        data=None,
        message="Success",
        status_code=200,
        **extra
    ):
        response = {
            "success": True,
            "message": message,
            "data": data,
        }

        response.update(extra)

        return Response(
            response,
            status=status_code,
        )

    @staticmethod
    def error(
        message="Error",
        errors=None,
        status_code=400,
        **extra
    ):
        response = {
            "success": False,
            "message": message,
            "errors": errors,
        }

        response.update(extra)

        return Response(
            response,
            status=status_code,
        )