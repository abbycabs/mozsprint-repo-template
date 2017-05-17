---
---

This is a list of courses

List

{% for course in site.data.courses %}
## {{ course.title }}
license: {{course.license}}
availability: {{ course.course_availability }}
{% endfor %}
