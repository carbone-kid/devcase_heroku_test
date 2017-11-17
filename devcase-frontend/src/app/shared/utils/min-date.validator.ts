/** A hero's name can't match the given regular expression */
import { FormControl, NG_VALIDATORS } from '@angular/forms';

import { Directive, forwardRef } from '@angular/core';

function validateDateFactory(requestedDate?: Date) {
  return (c: FormControl) => {
    if (!requestedDate) {
      requestedDate = new Date();
    }
    console.log('min date validator');
    return c.value <= requestedDate ? null : {
      validateEmail: {
        valid: false
      }
    };
  };
}

@Directive({
  selector: '[minDate][ngModel]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => MinDateValidator), multi: true}
  ]
})

export class MinDateValidator {
  validator: Function;

  constructor() {
    this.validator = validateDateFactory();
  }

  validate(c: FormControl) {
    return this.validator();
  }
}
