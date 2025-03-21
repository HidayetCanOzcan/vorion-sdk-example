'use client';
import { useState, useTransition } from 'react';
import { ActionResponse } from './types';

function useAction<A = undefined, R = unknown, E = unknown>(
	action: A extends undefined ? () => Promise<ActionResponse<R, E>> : (args: A) => Promise<ActionResponse<R, E>>,
	afterHandle?: (data: R, allData?: ActionResponse<R, E>['response']) => void,
	errorHandle?: (error: E, code: number | null) => void,
	mergeData?: (oldData: R, newData: R) => R
) {
	const [isPending, startTransition] = useTransition();
	const [data, setData] = useState<R | undefined>();
	const [responseCode, setResponseCode] = useState<number | null>(null);
	const [errors, setErrors] = useState<E | undefined>();

	function startAction(args?: A) {
		startTransition(async () => {
			const res = await action(args as A);
			setResponseCode(res.code);
			if (!res?.isSuccess) {
				setErrors(res.errors);
				if (errorHandle) {
					errorHandle(res.errors as E, res.code);
				}
			} else if (res.response) {
				let newData: R;
				if (typeof res.response === 'object' && 'data' in res.response) {
					newData = (res.response as { data: R }).data;
				} else {
					newData = res.response;
				}
				setData((prevData) => {
					if (prevData && mergeData) {
						return mergeData(prevData, newData);
					}
					return newData;
				});

				if (afterHandle) afterHandle(newData, res.response);
			} else {
				if (afterHandle) afterHandle(res.response as R, res.response);
			}
		});
	}

	return { isPending, startAction, data, responseCode, errors };
}

export default useAction;