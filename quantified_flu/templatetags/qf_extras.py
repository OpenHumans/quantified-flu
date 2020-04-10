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


@register.tag(name="get_formfield_value")
def get_formfield_value(parser, token):
    """
    Sets context variable "field_value" from the form for the field provided.

    This enables programmatically handling HTML for form fields in the template.
    """
    try:
        tag_name, variable_name = token.split_contents()
    except ValueError:
        raise template.TemplateSyntaxError(
            "%r tag requires a single argument" % token.contents.split()[0]
        )
    return FormFieldValueNode(variable_name)


class FormFieldValueNode(template.Node):
    def __init__(self, variable_name, **kwargs):
        self.variable_name = variable_name

    def render(self, context):
        form = context["form"]
        field_name = context[self.variable_name][0]
        field_value = form[field_name].value()
        context["field_value"] = field_value
        return ""
