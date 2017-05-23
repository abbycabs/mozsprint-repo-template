---
---

This is a list of courses

List

{% for course in site.courses %}
## {{ course.title }}
url: {{course.url}}
license: {{course.license}}
availability: {{ course.course_availability }}
{% endfor %}
