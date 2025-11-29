import re

from ..schemas import AutocompleteRequest, AutocompleteResponse


class AutocompleteService:
    @staticmethod
    def get_suggestion(request: AutocompleteRequest) -> AutocompleteResponse:
        """
        Mock AI autocomplete service.
        Returns simple rule-based suggestions.
        """
        code = request.code
        cursor_pos = request.cursorPosition
        language = request.language

        # Get text before cursor
        text_before = code[:cursor_pos] if cursor_pos <= len(code) else code

        # Simple pattern matching for Python
        if language == "python":
            # Check for common patterns
            if text_before.endswith("def "):
                return AutocompleteResponse(
                    suggestion="function_name(param1, param2):", confidence=0.85
                )
            elif text_before.endswith("class "):
                return AutocompleteResponse(suggestion="ClassName:", confidence=0.85)
            elif text_before.endswith("import "):
                return AutocompleteResponse(suggestion="numpy as np", confidence=0.75)
            elif text_before.endswith("for "):
                return AutocompleteResponse(
                    suggestion="i in range(10):", confidence=0.80
                )
            elif text_before.endswith("if "):
                return AutocompleteResponse(suggestion="condition:", confidence=0.80)
            elif re.search(r"print\($", text_before):
                return AutocompleteResponse(
                    suggestion='"Hello, World!")', confidence=0.70
                )

        # JavaScript patterns
        elif language == "javascript":
            if text_before.endswith("function "):
                return AutocompleteResponse(
                    suggestion="functionName() {", confidence=0.85
                )
            elif text_before.endswith("const "):
                return AutocompleteResponse(suggestion="variable = ", confidence=0.80)

        # Default suggestion
        return AutocompleteResponse(suggestion="", confidence=0.0)
