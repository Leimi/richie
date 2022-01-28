import { Children, Fragment } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { CourseProvider, useCourse } from 'data/CourseProductsProvider';
import { Spinner } from 'components/Spinner';
import type * as Joanie from 'types/Joanie';
import CourseProductItem from 'components/CourseProductsList/CourseProductItem';

export const messages = defineMessages({
  enrolled: {
    defaultMessage: 'Enrolled',
    description: 'Message displayed when authenticated user owned the product',
    id: 'components.CourseProductsList.enrolled',
  },
  start: {
    defaultMessage: 'Start',
    description: 'Start label displayed in the header of course run dates section',
    id: 'components.CourseProductsList.start',
  },
  end: {
    defaultMessage: 'End',
    description: 'End label displayed in the header of course run dates section',
    id: 'components.CourseProductsList.end',
  },
  certificateExplanation: {
    defaultMessage:
      'You will be able to download your certificate once you will pass all course runs.',
    description: 'Text displayed when the product certificate has no description',
    id: 'components.CourseProductsList.certificateExplanation',
  },
  enroll: {
    defaultMessage: 'Enroll',
    description: 'Text label for the enroll button',
    id: 'components.CourseProductsList.enroll',
  },
  loadingInitial: {
    defaultMessage: 'Loading course information...',
    description:
      'Accessible text for the initial loading spinner displayed when course is fetching',
    id: 'components.CourseProductsList.loadingInitial',
  },
});

interface Props {
  code: Joanie.Course['code'];
}

const List = () => {
  const course = useCourse();

  const getProductOrder = (productId: Joanie.Course['products'][0]['id']) => {
    return course.item?.orders?.find((order) => order.product === productId);
  };

  // - useCourse hook is fetching data
  if (course.states.fetching) {
    return (
      <Spinner aria-labelledby="loading-course">
        <span id="loading-course">
          <FormattedMessage {...messages.loadingInitial} />
        </span>
      </Spinner>
    );
  }

  // - There is no related course from Joanie
  if (!course.item) return null;

  return (
    <Fragment>
      {Children.toArray(
        course.item.products.map((product) => (
          <CourseProductItem product={product} order={getProductOrder(product.id)} />
        )),
      )}
    </Fragment>
  );
};

const CourseProductsList = ({ code }: Props) => (
  <CourseProvider code={code}>
    <List />
  </CourseProvider>
);

export default CourseProductsList;
