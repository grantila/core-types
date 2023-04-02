import type { NodeDocument, NodeType, OrType } from './types.js'
import { simplify } from './simplify.js'


describe( "simplify", ( ) =>
{
	it( "document", ( ) =>
	{
		const result = simplify( {
			version: 1,
			types: [
				{
					name: 'x',
					type: 'string',
					const: 'foo',
				},
			],
		} );

		expect( result ).toStrictEqual( {
			version: 1,
			types: [
				{
					name: 'x',
					type: 'string',
					const: 'foo',
				},
			],
		} );
	} );

	it( "array of types", ( ) =>
	{
		const result = simplify( [
			{
				type: 'string',
				const: 'foo',
			},
			{
				type: 'number',
				const: 3,
			},
		] );

		expect( result ).toStrictEqual( [
			{
				type: 'string',
				const: 'foo',
			},
			{
				type: 'number',
				const: 3,
			},
		] );
	} );

	it( "primitive type", ( ) =>
	{
		const result = simplify( {
			type: 'string',
			const: 'foo',
		} );

		expect( result ).toStrictEqual( {
			type: 'string',
			const: 'foo',
		} );
	} );

	it( "union of refs", ( ) =>
	{
		const result = simplify( {
			type: 'or',
			or: [
				{
					type: 'ref',
					ref: 'foo',
				},
				{
					type: 'ref',
					ref: 'bar',
				},
			]
		} );

		expect( result ).toStrictEqual( {
			type: 'or',
			or: [
				{
					type: 'ref',
					ref: 'foo',
				},
				{
					type: 'ref',
					ref: 'bar',
				},
			]
		} );
	} );

	it( "bool union true and false", ( ) =>
	{
		const result = simplify( {
			type: 'or',
			or: [
				{
					type: 'boolean',
					const: true,
				},
				{
					type: 'boolean',
					const: false,
				}
			],
		} );

		expect( result ).toStrictEqual( { type: 'boolean' } );
	} );

	it( "bool union empty enums", ( ) =>
	{
		const result = simplify( {
			type: 'or',
			or: [
				{ type: 'boolean' },
				{ type: 'boolean' }
			],
		} );

		expect( result ).toStrictEqual( { type: 'boolean' } );
	} );

	it( "or union multiple", ( ) =>
	{
		const result = simplify( {
			type: 'or',
			or: [
				{
					type: 'or',
					or: [ { type: 'string' }, { type: 'number' } ],
				},
				{
					type: 'or',
					or: [ { type: 'boolean' }, { type: 'integer' } ],
				}
			],
		} );

		expect( result ).toStrictEqual( {
			type: 'or',
			or: [
				{ type: 'string' },
				{ type: 'number' },
				{ type: 'boolean' },
				{ type: 'integer' },
			],
		} );
	} );

	it( "and types without sub-ands", ( ) =>
	{
		const node: NodeType = {
			type: 'and',
			and: [
				{
					type: 'string',
					const: "foo",
				},
				{
					type: 'number',
					const: 42,
				},
			]
		};
		const result = simplify( node );

		expect( result ).toStrictEqual( node );
	} );

	it( "and types with single sub-and and single sub-or", ( ) =>
	{
		const node: NodeType = {
			type: 'and',
			and: [
				{
					type: 'string',
					const: "foo",
				},
				{
					type: 'and',
					and: [
						{
							type: 'number',
							const: 42,
						}
					]
				},
				{
					type: 'or',
					or: [
						{
							type: 'boolean',
							const: true,
						}
					]
				},
			]
		};
		const result = simplify( node );

		expect( result ).toStrictEqual( {
			type: 'and',
			and: [
				{
					type: 'string',
					const: "foo",
				},
				{
					type: 'number',
					const: 42,
				},
				{
					type: 'boolean',
					const: true,
				},
			]
		} );
	} );

	it( "should flatten single ors and ands", ( ) =>
	{
		const node: Array< NodeType > = [
			{
				type: 'or',
				or: [
					{
						type: 'and',
						and: [
							{
								type: 'or',
								or: [
									{ type: 'string' }
								]
							}
						]
					}
				]
			},
			{
				type: 'and',
				and: [
					{
						type: 'or',
						or: [
							{
								type: 'and',
								and: [
									{ type: 'number' }
								]
							}
						]
					}
				]
			},
		];

		expect( simplify( node ) ).toStrictEqual( [
			{ type: 'string' },
			{ type: 'number' },
		] );
	} );

	it( "should remove empty ors and ands", ( ) =>
	{
		const node: NodeDocument = {
			version: 1,
			types: [
				{
					name: 'ors',
					type: 'or',
					or: [
						{ type: 'and', and: [ ] },
						{ type: 'string' },
						{ type: 'or', or: [ ] },
					]
				},
				{
					name: 'ands',
					type: 'and',
					and: [
						{ type: 'and', and: [ ] },
						{ type: 'number' },
						{ type: 'or', or: [ ] },
					]
				},
			]
		};

		expect( simplify( node ) ).toStrictEqual( {
			version: 1,
			types: [
				{ name: 'ors', type: 'string' },
				{ name: 'ands', type: 'number' },
			]
		} );
	} );

	describe( "should remove empty ors and ands in nested structures", ( ) =>
	{
		const bloatedAndsAndOrs: OrType = {
			type: 'or',
			title: 'Main or',
			or: [
				{
					type: 'or',
					or: [
						{ type: 'and', and: [ ] },
						{ type: 'string' },
						{ type: 'or', or: [ ] },
					]
				},
				{
					type: 'and',
					and: [
						{ type: 'and', and: [ ] },
						{ type: 'number' },
						{ type: 'or', or: [ ] },
					]
				},
			],
		};
		const simpleAndsAndOrs: OrType = {
			type: 'or',
			title: 'Main or',
			or: [
				{ type: 'string' },
				{ type: 'number' },
			],
		};

		it( "inside an object", ( ) =>
		{
			const node: NodeDocument = {
				version: 1,
				types: [
					{
						name: 'o',
						type: 'object',
						additionalProperties: false,
						properties: {
							foo: { required: true, node: bloatedAndsAndOrs },
						},
					},
				]
			};

			expect( simplify( node ) ).toStrictEqual( {
				version: 1,
				types: [
					{
						name: 'o',
						type: 'object',
						additionalProperties: false,
						properties: {
							foo: { required: true, node: simpleAndsAndOrs },
						},
					},
				]
			} );
		} );

		it( "inside an object w/ additionalProperties", ( ) =>
		{
			const node: NodeDocument = {
				version: 1,
				types: [
					{
						name: 'o',
						type: 'object',
						additionalProperties: bloatedAndsAndOrs,
						properties: {
							foo: { required: true, node: bloatedAndsAndOrs },
						},
					},
				]
			};

			expect( simplify( node ) ).toStrictEqual( {
				version: 1,
				types: [
					{
						name: 'o',
						type: 'object',
						additionalProperties: simpleAndsAndOrs,
						properties: {
							foo: { required: true, node: simpleAndsAndOrs },
						},
					},
				]
			} );
		} );

		it( "inside an tuple", ( ) =>
		{
			const node: NodeDocument = {
				version: 1,
				types: [
					{
						name: 'tup',
						type: 'tuple',
						additionalItems: false,
						elementTypes: [ bloatedAndsAndOrs ],
						minItems: 1,
					},
				]
			};

			expect( simplify( node ) ).toStrictEqual( {
				version: 1,
				types: [
					{
						name: 'tup',
						type: 'tuple',
						additionalItems: false,
						elementTypes: [ simpleAndsAndOrs ],
						minItems: 1,
					},
				]
			} );
		} );

		it( "inside an tuple w/ additionalItems", ( ) =>
		{
			const node: NodeDocument = {
				version: 1,
				types: [
					{
						name: 'tup',
						type: 'tuple',
						additionalItems: bloatedAndsAndOrs,
						elementTypes: [ bloatedAndsAndOrs ],
						minItems: 1,
					},
				]
			};

			expect( simplify( node ) ).toStrictEqual( {
				version: 1,
				types: [
					{
						name: 'tup',
						type: 'tuple',
						additionalItems: simpleAndsAndOrs,
						elementTypes: [ simpleAndsAndOrs ],
						minItems: 1,
					},
				]
			} );
		} );

		it( "inside an array", ( ) =>
		{
			const node: NodeDocument = {
				version: 1,
				types: [
					{
						name: 'arr',
						type: 'array',
						elementType: bloatedAndsAndOrs,
					},
				]
			};

			expect( simplify( node ) ).toStrictEqual( {
				version: 1,
				types: [
					{
						name: 'arr',
						type: 'array',
						elementType: simpleAndsAndOrs,
					},
				]
			} );
		} );

		it( "deep inside an array", ( ) =>
		{
			const node: NodeDocument = {
				version: 1,
				types: [
					{
						name: 'arr',
						type: 'array',
						elementType: {
							type: 'or',
							or: [
								{
									name: 'tup',
									type: 'tuple',
									additionalItems: bloatedAndsAndOrs,
									elementTypes: [ bloatedAndsAndOrs ],
									minItems: 1,
								}
							]
						},
					},
				]
			};

			expect( simplify( node ) ).toStrictEqual( {
				version: 1,
				types: [
					{
						name: 'arr',
						type: 'array',
						elementType: {
							name: 'tup',
							type: 'tuple',
							additionalItems: simpleAndsAndOrs,
							elementTypes: [ simpleAndsAndOrs ],
							minItems: 1,
						},
					},
				]
			} );
		} );
	} );

	it( "should remove empty ors and ands and prefer 'any' in 'or'", ( ) =>
	{
		const node: NodeDocument = {
			version: 1,
			types: [
				{
					type: "and",
					and: [
						{ type: "or", or: [ ] },
						{
							type: "or",
							or: [
								{
									type: "string"
								},
								{
									type: "any"
								}
							],
						},
						{ type: "and", and: [ ] }
					],
					name: "StringOrAny"
				}
			]
		};

		expect( simplify( node ) ).toStrictEqual( {
			version: 1,
			types: [
				{ name: 'StringOrAny', type: 'any' },
			]
		} );
	} );

	it( "and types with multiple sub-and and multiple sub-or", ( ) =>
	{
		const node: NodeType = {
			type: 'and',
			and: [
				{
					type: 'and',
					and: [
						{
							type: 'string',
							const: "foo",
						},
						{
							type: 'string',
							enum: [ "foo", "bar" ],
						},
					]
				},
				{
					type: 'and',
					and: [
						{
							type: 'number',
							enum: [ 17, 42 ],
						},
						{
							type: 'integer',
							const: 17,
						},
					]
				},
				{
					type: 'or',
					or: [
						{
							type: 'boolean',
							const: true,
						},
						{
							type: 'boolean',
							const: false,
						},
					]
				},
			]
		};
		const result = simplify( node );

		expect( result ).toStrictEqual( {
			type: 'and',
			and: [
				{
					type: 'string',
					const: "foo",
				},
				{
					type: 'number',
					const: 17,
				},
				{
					type: 'boolean',
				},
			]
		} );
	} );

	it( "or types with single sub-and and single sub-or", ( ) =>
	{
		const node: NodeType = {
			type: 'or',
			or: [
				{
					type: 'string',
					const: "foo",
				},
				{
					type: 'and',
					and: [
						{
							type: 'number',
							const: 42,
						}
					]
				},
				{
					type: 'or',
					or: [
						{
							type: 'boolean',
							const: true,
						}
					]
				},
			]
		};
		const result = simplify( node );

		expect( result ).toStrictEqual( {
			type: 'or',
			or: [
				{
					type: 'string',
					const: "foo",
				},
				{
					type: 'number',
					const: 42,
				},
				{
					type: 'boolean',
					const: true,
				},
			]
		} );
	} );

	it( "or types with multiple const of same type (become enum)", ( ) =>
	{
		const node: NodeType = {
			type: 'or',
			or: [
				{
					type: 'string',
					const: 'foo',
				},
				{
					type: 'and',
					and: [
						{
							type: 'number',
							const: 42,
						}
					]
				},
				{
					type: 'or',
					or: [
						{
							type: 'string',
							const: 'bar',
						}
					]
				},
			]
		};
		const result = simplify( node );

		expect( result ).toStrictEqual( {
			type: 'or',
			or: [
				{
					type: 'string',
					enum: [ 'foo', 'bar' ],
				},
				{
					type: 'number',
					const: 42,
				},
			]
		} );
	} );

	it( "or types with multiple const or enum (become enum)", ( ) =>
	{
		const node: NodeType = {
			type: 'or',
			or: [
				{
					type: 'string',
					const: 'foo',
				},
				{
					type: 'and',
					and: [
						{
							type: 'string',
							enum: [ 'bar', 'baz' ],
						}
					]
				},
				{
					type: 'or',
					or: [
						{
							type: 'string',
							const: 'bak',
						}
					]
				},
			]
		};
		const result = simplify( node );

		expect( result ).toStrictEqual( {
			type: 'string',
			enum: [ 'foo', 'bar', 'baz', 'bak' ],
		} );
	} );

	it( "or types with const/enum and generic (become generic)", ( ) =>
	{
		const node: NodeType = {
			type: 'or',
			or: [
				{
					type: 'string',
					const: 'foo',
					description: 'this is a foo'
				},
				{
					type: 'and',
					and: [
						{
							type: 'string',
							enum: [ 'bar', 'baz' ],
							title: 'this has a title',
							description: 'and a bar-baz description',
						}
					]
				},
				{
					type: 'or',
					or: [
						{
							type: 'string',
							see: 'me',
						}
					]
				},
			]
		};
		const result = simplify( node );

		expect( result ).toStrictEqual( {
			type: 'string',
			description: 'this is a foo\nand a bar-baz description',
			title: 'this has a title',
			see: 'me',
		} );
	} );

	it( "maintain or-order", ( ) =>
	{
		const node1: NodeType = {
			type: 'or',
			or: [
				{
					type: 'string',
				},
				{
					type: 'number',
				},
			]
		};
		const result1 = simplify( node1 );
		expect( result1 ).toStrictEqual( node1 );

		// This will ensure issue #2 is resolved
		const node2: NodeType = {
			type: 'or',
			or: [
				{
					type: 'number',
				},
				{
					type: 'string',
				},
			]
		};
		const result2 = simplify( node2 );
		expect( result2 ).toStrictEqual( node2 );
	} );

	it( "and with any", ( ) =>
	{
		const node: NodeType = {
			type: 'and',
			and: [
				{
					type: 'string',
				},
				{
					type: 'any',
				},
			]
		};
		const result = simplify( node );

		expect( result ).toStrictEqual( {
			type: 'string',
		} );
	} );

	describe( "merge objects", ( ) =>
	{
		it( "should not merge if there are non-objects", ( ) =>
		{
			const node: NodeType = {
				type: 'and',
				and: [
					{
						type: 'string',
					},
					{
						type: 'object',
						properties: {
							a: { node: { type: 'number' }, required: false },
						},
						additionalProperties: false,
					},
					{
						type: 'object',
						properties: {
							b: { node: { type: 'boolean' }, required: false },
						},
						additionalProperties: false,
					},
				]
			};
			const result = simplify( node, { mergeObjects: true } );

			expect( result ).toStrictEqual( node );
		} );

		it( "should be able to simply merge two objects", ( ) =>
		{
			const node: NodeType = {
				type: 'and',
				and: [
					{
						type: 'object',
						properties: {
							a: { node: { type: 'number' }, required: false },
						},
						additionalProperties: false,
					},
					{
						type: 'object',
						properties: {
							b: { node: { type: 'boolean' }, required: false },
						},
						additionalProperties: false,
					},
				]
			};
			const result = simplify( node, { mergeObjects: true } );

			expect( result ).toStrictEqual( {
				type: 'object',
				properties: {
					a: { node: { type: 'number' }, required: false },
					b: { node: { type: 'boolean' }, required: false },
				},
				additionalProperties: false,
			} );
		} );

		it( "should prefer additionalProperties with node over false", ( ) =>
		{
			const node: NodeType = {
				type: 'and',
				and: [
					{
						type: 'object',
						properties: {
							a: { node: { type: 'number' }, required: false },
						},
						additionalProperties: false,
					},
					{
						type: 'object',
						properties: {
							b: { node: { type: 'boolean' }, required: false },
						},
						additionalProperties: { type: 'string' },
					},
				]
			};
			const result = simplify( node, { mergeObjects: true } );

			expect( result ).toStrictEqual( {
				type: 'object',
				properties: {
					a: { node: { type: 'number' }, required: false },
					b: { node: { type: 'boolean' }, required: false },
				},
				additionalProperties: { type: 'string' },
			} );
		} );

		it( "should prefer additionalProperties with true over node", ( ) =>
		{
			const node: NodeType = {
				type: 'and',
				and: [
					{
						type: 'object',
						properties: {
							a: { node: { type: 'number' }, required: false },
						},
						additionalProperties: true,
					},
					{
						type: 'object',
						properties: {
							b: { node: { type: 'boolean' }, required: false },
						},
						additionalProperties: { type: 'string' },
					},
				]
			};
			const result = simplify( node, { mergeObjects: true } );

			expect( result ).toStrictEqual( {
				type: 'object',
				properties: {
					a: { node: { type: 'number' }, required: false },
					b: { node: { type: 'boolean' }, required: false },
				},
				additionalProperties: true,
			} );
		} );

		it( "should prefer prefer required on conflicting property", ( ) =>
		{
			const node: NodeType = {
				type: 'and',
				and: [
					{
						type: 'object',
						properties: {
							a: { node: { type: 'number' }, required: false },
						},
						additionalProperties: false,
					},
					{
						type: 'object',
						properties: {
							a: { node: { type: 'boolean' }, required: true },
						},
						additionalProperties: false,
					},
				]
			};
			const result = simplify( node, { mergeObjects: true } );

			expect( result ).toStrictEqual( {
				type: 'object',
				properties: {
					a: {
						node: {
							type: 'and',
							and: [ { type: 'number' }, { type: 'boolean' } ],
						},
						required: true,
					},
				},
				additionalProperties: false,
			} );
		} );

		it( "should handle refs and sub-intersections", ( ) =>
		{
			const node: NodeDocument = {
				version: 1,
				types: [
					{
						name: 'root',
						type: 'and',
						and: [
							{
								type: 'object',
								properties: {
									a: {
										node: { type: 'number' },
										required: false,
									},
									x: {
										node: { type: 'number' },
										required: false,
									},
								},
								additionalProperties: false,
							},
							{
								type: 'and',
								and: [
									{
										type: 'object',
										properties: {
											b: {
												node: { type: 'boolean' },
												required: false,
											},
											x: {
												node: { type: 'boolean' },
												required: false,
											},
										},
										additionalProperties: false,
									},
									{
										type: 'object',
										properties: {
											c: {
												node: { type: 'string' },
												required: false,
											},
											x: {
												node: { type: 'string' },
												required: false,
											},
										},
										additionalProperties: false,
									},
									{
										type: 'ref',
										ref: 'ext',
									},
								],
							},
						]
					},
					{
						name: 'ext',
						type: 'and',
						and: [ {
							type: 'and',
							and: [
								{
									type: 'object',
									properties: {
										d: {
											node: { type: 'null' },
											required: false
										},
										x: {
											node: { type: 'null' },
											required: false
										},
									},
									additionalProperties: false,
								}
							],
						} ],
					},
				],
			};
			const result = simplify( node, { mergeObjects: true } );

			expect( result ).toStrictEqual( {
				version: 1,
				types: [
					{
						name: 'root',
						type: 'object',
						properties: {
							a: {
								node: { type: 'number' },
								required: false,
							},
							b: {
								node: { type: 'boolean' },
								required: false,
							},
							c: {
								node: { type: 'string' },
								required: false,
							},
							d: {
								node: { type: 'null' },
								required: false
							},
							x: {
								node: {
									type: 'and',
									and: [
										{ type: 'number' },
										{ type: 'boolean' },
										{ type: 'string' },
										{ type: 'null' },
									],
								},
								required: false,
							},
						},
						additionalProperties: false,
					},
					{
						name: 'ext',
						type: 'object',
						properties: {
							d: {
								node: { type: 'null' },
								required: false
							},
							x: {
								node: { type: 'null' },
								required: false
							},
						},
						additionalProperties: false,
					},
				],
			} satisfies NodeDocument );
		} );
	} );
} );
