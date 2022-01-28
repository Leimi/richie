import { Fragment, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useSelect } from 'downshift';
import { handle } from 'utils/errors/handle';
import type * as Joanie from 'types/Joanie';
import { Spinner } from 'components/Spinner';
import API from 'utils/api/joanie';

interface Props {
  order: Joanie.OrderLite;
}

enum MenuItemKey {
  DOWNLOAD_INVOICE = 'downloadInvoice',
}

const messages = defineMessages({
  [MenuItemKey.DOWNLOAD_INVOICE]: {
    id: 'components.PurchasedProductMenu.downloadInvoice',
    defaultMessage: 'Download invoice',
    description: 'Label for selector item to download invoice',
  },
});

const PurchasedProductMenu = ({ order }: Props) => {
  const [loading, setLoading] = useState(false);

  const downloadInvoice = async () => {
    try {
      setLoading(true);
      const $link = document.createElement('a');
      const file = await API().user.orders.invoice.download({
        order_id: order.id,
        invoice_reference: order.main_invoice,
      });
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

  const items = [
    {
      key: MenuItemKey.DOWNLOAD_INVOICE,
      action: downloadInvoice,
    },
  ];

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({ items });

  const selectorListClasses = useMemo(() => {
    const classList = ['selector__list'];

    if (!isOpen) {
      classList.push('selector__list--is-closed');
    }

    return classList.join(' ');
  }, [loading, isOpen]);

  const selectorItemClasses = (index: Number) => {
    const classList = ['selector__list__link'];

    if (highlightedIndex === index) {
      classList.push('selector__list__link--highlighted');
    }

    return classList.join(' ');
  };

  return (
    <nav className="selector">
      <label {...getLabelProps()} className="offscreen">
        Other actions related to this product
      </label>
      {loading ? (
        <Spinner theme="light" />
      ) : (
        <Fragment>
          <button {...getToggleButtonProps()} className="selector__button">
            <svg role="img" className="selector__button__icon" aria-hidden>
              <use xlinkHref="#icon-three-vertical-dots" />
            </svg>
          </button>
          <ul {...getMenuProps()} className={selectorListClasses}>
            {isOpen &&
              items.map((item, index) => (
                <li key={item.key} {...getItemProps({ item, index })}>
                  <button className={selectorItemClasses(index)} onClick={item.action}>
                    <FormattedMessage {...messages[item.key]} />
                  </button>
                </li>
              ))}
          </ul>
        </Fragment>
      )}
    </nav>
  );
};

export default PurchasedProductMenu;
