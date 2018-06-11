"""
Courses factories
"""
import io
import os
import random

from django.conf import settings
from django.core.files import File
from django.utils.text import slugify

import factory
from cms.api import add_plugin, create_page
from filer.models.imagemodels import Image

from .models import Course, Organization, Subject


def file_getter(image_type):
    """
    Return a function that picks a random image for a given type of image (logo, banner,...)
    This function can be passed to factory boy's ImageField to dynamically generate image fields.
    """

    def pick_random():
        """
        Pick a random file from fixtures within the image type passed as argument to the parent
        function.
        """
        image_directory = os.path.join(
            os.path.dirname(__file__), os.path.join("fixtures", image_type)
        )
        filename = random.choice(os.listdir(image_directory))

        # Factory boy's "from_func" param is expecting a file but does not seem to close it
        # properly. Let's load the content of the file in memory and pass it as a BytesIO to
        # factory boy so that the file is nicely closed
        with open(os.path.join(image_directory, filename), "rb") as image_file:
            in_memory_file = io.BytesIO(image_file.read())
            in_memory_file.name = filename
        return in_memory_file

    return pick_random


class OrganizationFactory(factory.django.DjangoModelFactory):
    """
    A factory to automatically generate random yet meaningful organization page extensions
    in our tests.
    """

    class Meta:
        model = Organization
        exclude = ["parent", "title"]

    parent = None
    logo = factory.django.ImageField(
        width=180, height=100, from_func=file_getter("logo")
    )
    title = factory.Faker("company")

    @factory.lazy_attribute
    def extended_object(self):
        """
        Automatically create a related page with the random title
        """
        return create_page(
            self.title,
            "courses/cms/organization_detail.html",
            settings.LANGUAGE_CODE,
            parent=self.parent,
        )

    @factory.lazy_attribute
    def code(self):
        """
        Since `name` is required, let's just slugify it to get a meaningful code (and keep it
        below 100 characters)
        """
        return slugify(self.title)[:100]

    @factory.post_generation
    # pylint: disable=unused-argument, attribute-defined-outside-init, no-member
    def with_courses(self, create, extracted, **kwargs):
        """Add courses to ManyToMany relation."""
        if create and extracted:
            self.courses.set(extracted)

    @factory.post_generation
    # pylint: disable=unused-argument
    def with_content(self, create, extracted, **kwargs):
        """
        Add content plugins displayed in the "maincontent" placeholder of the organization page:
        - Picture plugin featuring a random banner image,
        - Text plugin featuring a long random description.
        """
        if create and extracted:
            language = settings.LANGUAGE_CODE
            placeholder = self.extended_object.placeholders.get(slot="maincontent")

            # Add a banner with a random image
            banner_file = file_getter("banner")()
            wrapped_banner = File(banner_file, banner_file.name)
            banner = Image.objects.create(file=wrapped_banner)
            add_plugin(
                language=language,
                placeholder=placeholder,
                plugin_type="PicturePlugin",
                picture=banner,
                attributes={"alt": "banner image"},
            )

            # Add a text plugin with a long random description
            nb_paragraphs = random.randint(2, 4)
            paragraphs = [
                factory.Faker("text", max_nb_chars=random.randint(200, 1000)).generate(
                    {}
                )
                for i in range(nb_paragraphs)
            ]
            body = ["<p>{:s}</p>".format(p) for p in paragraphs]
            add_plugin(
                language=language,
                placeholder=placeholder,
                plugin_type="TextPlugin",
                body="".join(body),
            )


class CourseFactory(factory.django.DjangoModelFactory):
    """
    A factory to automatically generate random yet meaningful course page extensions
    and their related page in our tests.

    The `active_session` field is set to a realistic Splitmongo course key in Open edX which
    matches the following pattern:

        {version}:{organization_code}+{number}+{session}

        e.g. "course-v1:CNAM+01032+session01"
    """

    class Meta:
        model = Course
        exclude = ["number", "session", "title", "version"]

    title = factory.Faker("catch_phrase")

    version = factory.Sequence(lambda n: "version-v{version}".format(version=n + 1))
    number = factory.Faker("numerify", text="#####")
    session = factory.Sequence(lambda n: "session{session:02d}".format(session=n + 1))

    active_session = factory.LazyAttribute(
        lambda o: "{version}:{organization_code}+{number}+{session}".format(
            version=o.version,
            organization_code=o.main_organization.code
            if o.main_organization
            else "xyz",
            number=o.number,
            session=o.session,
        )
    )
    main_organization = factory.SubFactory(OrganizationFactory)

    @factory.lazy_attribute
    def extended_object(self):
        """
        Automatically create a related page with the random title
        """
        return create_page(self.title, Course.TEMPLATE_DETAIL, settings.LANGUAGE_CODE)

    @factory.post_generation
    # pylint: disable=unused-argument, attribute-defined-outside-init, no-member
    def with_subjects(self, create, extracted, **kwargs):
        """Add subjects to ManyToMany relation."""
        if create and extracted:
            self.subjects.set(extracted)

    @factory.post_generation
    # pylint: disable=unused-argument, attribute-defined-outside-init
    def with_organizations(self, create, extracted, **kwargs):
        """Add organizations to ManyToMany relation."""
        if create and extracted:
            self.organizations.set(extracted)


class SubjectFactory(factory.django.DjangoModelFactory):
    """
    A factory to automatically generate random yet meaningful subject page extensions
    and their related page in our tests.
    """

    class Meta:
        model = Subject
        exclude = ["title"]

    title = factory.Faker("catch_phrase")

    @factory.lazy_attribute
    def extended_object(self):
        """
        Automatically create a related page with the random title
        """
        return create_page(self.title, Subject.TEMPLATE_DETAIL, settings.LANGUAGE_CODE)

    @factory.post_generation
    # pylint: disable=unused-argument, attribute-defined-outside-init, no-member
    def with_courses(self, create, extracted, **kwargs):
        """Add courses to ManyToMany relation."""
        if create and extracted:
            self.courses.set(extracted)
