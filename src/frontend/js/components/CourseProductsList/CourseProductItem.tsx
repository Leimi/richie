import type * as Joanie from 'types/Joanie';
import { Children } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import PurchasedProductMenu from 'components/CourseProductsList/PurchasedProductMenu';
import CourseRunList from 'components/CourseProductsList/CourseRunList';
import EnrollableCourseRunList from 'components/CourseProductsList/EnrollableCourseRunList';
import EnrolledCourseRun from 'components/CourseProductsList/EnrolledCourseRun';
import { SaleTunnel } from 'components/SaleTunnel';
import { messages } from 'components/CourseProductsList/index';
import CertificateItem from 'components/CourseProductsList/CertificateItem';

interface CourseProductItemProps {
  product: Joanie.Product;
  order?: Joanie.OrderLite;
}

const CourseProductItem = ({ product, order }: CourseProductItemProps) => {
  const isOwned = order !== undefined;

  const isEnrolled = (productId: string, targetCourse: Joanie.CourseProductTargetCourse) => {
    return !!getCourseRunEnrollment(productId, targetCourse)?.is_active;
  };

  const getCourseRunEnrollment = (
    productId: string,
    targetCourse: Joanie.CourseProductTargetCourse,
  ) => {
    if (!isOwned) return undefined;

    const resourceLinks = targetCourse.course_runs.map(({ resource_link }) => resource_link);
    return order.enrollments.find(({ is_active, resource_link }) => {
      return is_active && resourceLinks.includes(resource_link);
    });
  };

  return (
    <section className="product-widget">
      <header className="product-widget__header">
        <h3 className="product-widget__title">{product.title}</h3>
        <h6 className="product-widget__price">
          {isOwned ? (
            <FormattedMessage {...messages.enrolled} />
          ) : (
            <FormattedNumber
              currency={product.price_currency}
              value={product.price}
              style="currency"
            />
          )}
        </h6>
        {isOwned && <PurchasedProductMenu order={order} />}
      </header>
      <ol className="product-widget__content">
        {product.target_courses.map((target_course) =>
          Children.toArray(
            <li className="product-widget__item course">
              <h5 className="product-widget__item-title">{target_course.title}</h5>
              <section className="course__course-runs">
                <header className="course__course-runs-header">
                  <strong>
                    <FormattedMessage {...messages.start} />
                  </strong>
                  <strong>
                    <FormattedMessage {...messages.end} />
                  </strong>
                </header>
                {!isOwned && <CourseRunList courseRuns={target_course.course_runs} />}
                {isOwned && !isEnrolled(product.id, target_course) && (
                  <EnrollableCourseRunList courseRuns={target_course.course_runs} order={order} />
                )}
                {isOwned && isEnrolled(product.id, target_course) && (
                  <EnrolledCourseRun
                    courseRun={getCourseRunEnrollment(product.id, target_course)!}
                  />
                )}
              </section>
            </li>,
          ),
        )}
        {product.certificate && <CertificateItem certificate={product.certificate} order={order} />}
      </ol>
      {!isOwned && (
        <footer className="product-widget__footer">
          <SaleTunnel product={product} />
        </footer>
      )}
    </section>
  );
};

export default CourseProductItem;
