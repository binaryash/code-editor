"""API routes for handling code autocomplete requests."""

from fastapi import APIRouter

from ..schemas import AutocompleteRequest, AutocompleteResponse
from ..services.autocomplete_service import AutocompleteService

router = APIRouter(prefix="/autocomplete", tags=["autocomplete"])


@router.post("", response_model=AutocompleteResponse)
def get_autocomplete(request: AutocompleteRequest):
    """Retrieves a mock AI autocomplete suggestion based on code context."""
    return AutocompleteService.get_suggestion(request)
