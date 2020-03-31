from django import template

from quantified_flu.helpers import identify_missing_sources

register = template.Library()


@register.filter
def missing_sources(member):
    # try/except to fail gracefully on edge case when user has deauthorized
    # on open humans, but is still logged in locally.
    try:
        return identify_missing_sources(member)
    except Exception:
        return []
