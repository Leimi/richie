import type * as Joanie from 'types/Joanie';
import { useState } from 'react';
import API from 'utils/api/joanie';
import { handle } from 'utils/errors/handle';
import { Spinner } from 'components/Spinner';
import { FormattedMessage } from 'react-intl';
import { messages } from 'components/CourseProductsList/index';

interface CertificateWidgetProps {
  certificate: Joanie.CertificateDefinition;
  order?: Joanie.OrderLite;
}

const CertificateWidget = ({ certificate, order }: CertificateWidgetProps) => {
  const [loading, setLoading] = useState(false);
  const downloadCertificate = async () => {
    try {
      setLoading(true);
      const $link = document.createElement('a');
      const certificateId = order!.certificate!;
      const file = await API().user.certificates.download(certificateId);
      // eslint-disable-next-line compat/compat
      const url = URL.createObjectURL(file);
      $link.href = url;
      $link.download = '';

      const revokeObject = () => {
        // eslint-disable-next-line compat/compat
        URL.revokeObjectURL(url);
        window.removeEventListener('blur', revokeObject);
      };

      window.addEventListener('blur', revokeObject);
      $link.click();
    } catch (error) {
      handle(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <li className="product-widget__item certificate">
      <svg className="certificate__icon" role="img" viewBox="0 0 25 34">
        <use href="#icon-certificate" />
      </svg>
      <div>
        <h5 className="product-widget__item-title">{certificate.title}</h5>
        <p className="product-widget__item-description">
          {order?.certificate ? (
            <button className="button button--primary button--pill" onClick={downloadCertificate}>
              {loading ? <Spinner theme="light" /> : 'Download'}
            </button>
          ) : (
            certificate.description || <FormattedMessage {...messages.certificateExplanation} />
          )}
        </p>
      </div>
    </li>
  );
};

export default CertificateWidget;
