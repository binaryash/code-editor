from fastapi import APIRouter
from ..schemas import AutocompleteRequest, AutocompleteResponse
from ..services.autocomplete_service import AutocompleteService

router = APIRouter(prefix="/autocomplete", tags=["autocomplete"])


@router.post("", response_model=AutocompleteResponse)
def get_autocomplete(request: AutocompleteRequest):
    """Get AI-style autocomplete suggestions (mocked)"""
    return AutocompleteService.get_suggestion(request)
