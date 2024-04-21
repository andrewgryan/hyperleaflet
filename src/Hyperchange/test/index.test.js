// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import hyperChangeDetection from '..';

// Test to understand Hyperchange detection
describe('Hyperchange', () => {
  it('should observe innerHTML changes', () => {
    const targetSelector = '[data-hyperleaflet-source]';
    const uniqueAttribute = 'data-id';
    const attributeFilter = ['data-options'];

    // Arrange
    const source = document.createElement('div');
    source.dataset.hyperleafletSource = true;
    source.innerHTML = `
      <div data-id="1"
           data-options='{"opacity": 1}'></div>
    `;
    document.appendChild(source);

    // Capture subscription calls during test
    let calls = {
      add: [],
      remove: [],
      change: [],
    };

    // Observe data-hyperleaflet-source with data-id and data-*
    hyperChangeDetection.observe({
      targetSelector,
      uniqueAttribute,
      attributeFilter,
    });

    // Subscription needed for add, remove and change events
    hyperChangeDetection.subscribe(targetSelector, 'node_adds', (data) => {
      calls.add.push(data);
    });
    hyperChangeDetection.subscribe(targetSelector, 'node_removes', (data) => {
      calls.remove.push(data);
    });
    hyperChangeDetection.subscribe(targetSelector, 'node_changes', (data) => {
      calls.change.push(data);
    });

    // Act
    source.innerHTML = `
      <div data-id="1"
           data-options='{"opacity": 0.7}'></div>
    `;

    // Assert
    expect(calls.add.length).toBe(1);
    expect(calls.remove.length).toBe(1);
    expect(calls.change.length).toBe(0);

    // First invocation, first HTML element assertions
    expect(calls.remove[0][0].dataset).toEqual({ id: '1', options: '{"opacity": 1}' });
    expect(calls.add[0][0].dataset).toEqual({ id: '1', options: '{"opacity": 0.7}' });
  });
});
