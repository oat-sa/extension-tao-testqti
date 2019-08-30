/**
 * Selects the text content of passed element
 * @see https://github.com/cypress-io/cypress/issues/2839#issuecomment-447012818
 */
Cypress.Commands.add('selectText', { prevSubject: true }, (subject) => {
    cy.wrap(subject)
        .trigger('mousedown')
        .then(($el) => {
            const el = $el[0];
            const document = el.ownerDocument;
            const range = document.createRange();
            range.selectNodeContents(el);
            document.getSelection().removeAllRanges(range);
            document.getSelection().addRange(range);
        })
        .trigger('mouseup');

    cy.document().trigger('selectionchange');
    return cy.wrap(subject);
});

/**
 * Drags a DOM element by simulating mouse events
 * @param {Object} point
 * @param {Number} point.x
 * @param {Number} point.y
 * @param {String} [position] - Valid positions are topLeft, top, topRight, left, center, right, bottomLeft, bottom, and bottomRight
 * @returns {DOMElement}
 */
Cypress.Commands.add('dragToPoint', { prevSubject: true }, (subject, point, position = 'center') => {
    cy.wrap(subject)
        .trigger('mousedown', position, { force: true })
        .trigger('mousemove', { force: true, pageX: point.x, pageY: point.y, clientX: point.x, clientY: point.y, view: window })
        .trigger('mouseup');

    return cy.wrap(subject);
});

/**
 * Asserts that subject is not clickable (covered up, offscreen...)
 * @see https://stackoverflow.com/questions/52073331/assert-that-element-is-not-actionable-in-cypress
 *
 * Any assertions that follow this command will never be run, so make sure it is
 * the last in the `it()` block (or ideally an `it()` to itself)
 */
Cypress.Commands.add("isNotActionable", { prevSubject: true }, function(subject) {
    cy.once('fail', (err) => {
        expect(err.message).to.include('cy.click() failed because this element');
        expect(err.message).to.include('is being covered by another element');
    });
    cy.get(subject).click({ timeout: 25 }).then(() => {
        // '.then' will only fire if '.click' succeeded
        throw new Error('Expected element NOT to be clickable, but click() succeeded');
    });
});
