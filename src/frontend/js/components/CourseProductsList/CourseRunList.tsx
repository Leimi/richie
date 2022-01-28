import { Children } from 'react';
import { useIntl } from 'react-intl';
import type * as Joanie from 'types/Joanie';

export interface CourseRunListProps {
  courseRuns: Joanie.CourseRun[];
}

const CourseRunList = ({ courseRuns }: CourseRunListProps) => {
  const intl = useIntl();

  const formatDate = (date: string) =>
    intl.formatDate(date, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <ol className="course-runs-list">
      {Children.toArray(
        courseRuns.map((courseRun) => (
          <li className="course-runs-item course-runs-item--inactive">
            <em className="course-runs-item__date course-runs-item__date--start">
              {formatDate(courseRun.start)}
            </em>
            <span className="course-runs-item__date-separator" />
            <em className="course-runs-item__date course-runs-item__date--end">
              {formatDate(courseRun.end)}
            </em>
          </li>
        )),
      )}
    </ol>
  );
};

export default CourseRunList;
