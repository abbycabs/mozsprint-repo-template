---
---

This is a list of courses

List

{% for course in site.courses %}
## {{ course.title }}

license: {{course.license}}
availability: {{ course.course_availability }}
url: {{course.url}}
{% endfor %}
