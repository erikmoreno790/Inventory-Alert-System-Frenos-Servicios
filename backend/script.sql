BEGIN;


CREATE TABLE IF NOT EXISTS public.alertas
(
    id_alerta serial NOT NULL,
    id_product integer,
    fecha_alerta timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    canal character varying(20) COLLATE pg_catalog."default",
    enviado_a character varying(100) COLLATE pg_catalog."default",
    estado character varying(20) COLLATE pg_catalog."default" DEFAULT 'pendiente'::character varying,
    mensaje text COLLATE pg_catalog."default",
    CONSTRAINT alertas_pkey PRIMARY KEY (id_alerta)
);

CREATE TABLE IF NOT EXISTS public.alertas_usuarios
(
    id serial NOT NULL,
    alerta_id integer,
    usuario_id integer,
    canal character varying(20) COLLATE pg_catalog."default",
    estado character varying(20) COLLATE pg_catalog."default" DEFAULT 'pendiente'::character varying,
    CONSTRAINT alertas_usuarios_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.categorias
(
    id_categoria serial NOT NULL,
    nombre character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria),
    CONSTRAINT categorias_nombre_key UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS public.cotizacion_items
(
    id_cotizacion_item serial NOT NULL,
    id_cotizacion integer NOT NULL,
    cantidad integer NOT NULL,
    total numeric(12, 2),
    descripcion character varying(100) COLLATE pg_catalog."default",
    precio_unitario character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT cotizacion_items_pkey PRIMARY KEY (id_cotizacion_item)
);

CREATE TABLE IF NOT EXISTS public.cotizaciones
(
    id_cotizacion serial NOT NULL,
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    kilometraje integer,
    observaciones text COLLATE pg_catalog."default",
    estatus character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'Pendiente'::character varying,
    porcentaje_descuento numeric(5, 2) DEFAULT 0,
    descuento numeric(12, 2) DEFAULT 0,
    subtotal numeric(12, 2) DEFAULT 0,
    total numeric(12, 2) DEFAULT 0,
    nombre_cliente character varying(255) COLLATE pg_catalog."default",
    vehiculo character varying(100) COLLATE pg_catalog."default",
    placa character varying(20) COLLATE pg_catalog."default",
    modelo character varying(100) COLLATE pg_catalog."default",
    nombre_mecanico character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT cotizaciones_pkey PRIMARY KEY (id_cotizacion)
);

CREATE TABLE IF NOT EXISTS public.movimientos_stock
(
    id_movimiento serial NOT NULL,
    id_product integer,
    tipo character varying(20) COLLATE pg_catalog."default",
    cantidad integer NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_usuario integer,
    observaciones text COLLATE pg_catalog."default",
    CONSTRAINT movimientos_stock_pkey PRIMARY KEY (id_movimiento)
);

CREATE TABLE IF NOT EXISTS public.proveedores
(
    id_proveedor serial NOT NULL,
    nombre character varying(100) COLLATE pg_catalog."default" NOT NULL,
    contacto character varying(100) COLLATE pg_catalog."default",
    telefono character varying(20) COLLATE pg_catalog."default",
    email character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT proveedores_pkey PRIMARY KEY (id_proveedor)
);

CREATE TABLE IF NOT EXISTS public.repuestos
(
    id_product integer NOT NULL DEFAULT nextval('repuestos_id_repuesto_seq'::regclass),
    nombre character varying(100) COLLATE pg_catalog."default" NOT NULL,
    descripcion text COLLATE pg_catalog."default",
    id_categoria integer,
    id_proveedor integer,
    stock_actual integer DEFAULT 0,
    stock_minimo integer DEFAULT 0,
    precio_costo double precision DEFAULT 0,
    ubicacion character varying(100) COLLATE pg_catalog."default",
    codigo_interno character varying(50) COLLATE pg_catalog."default",
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT repuestos_pkey PRIMARY KEY (id_product),
    CONSTRAINT repuestos_codigo_interno_key UNIQUE (codigo_interno)
);

CREATE TABLE IF NOT EXISTS public.usuarios
(
    id_usuario serial NOT NULL,
    nombre character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default",
    password_hash character varying(255) COLLATE pg_catalog."default" NOT NULL,
    telefono character varying(20) COLLATE pg_catalog."default",
    rol character varying(20) COLLATE pg_catalog."default",
    whatsapp_opt_in boolean DEFAULT true,
    email_opt_in boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario)
);

ALTER TABLE IF EXISTS public.alertas
    ADD CONSTRAINT alertas_repuesto_id_fkey FOREIGN KEY (id_product)
    REFERENCES public.repuestos (id_product) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.alertas_usuarios
    ADD CONSTRAINT alertas_usuarios_alerta_id_fkey FOREIGN KEY (alerta_id)
    REFERENCES public.alertas (id_alerta) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.alertas_usuarios
    ADD CONSTRAINT alertas_usuarios_usuario_id_fkey FOREIGN KEY (usuario_id)
    REFERENCES public.usuarios (id_usuario) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.cotizacion_items
    ADD CONSTRAINT fk_ci_cotizacion FOREIGN KEY (id_cotizacion)
    REFERENCES public.cotizaciones (id_cotizacion) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.movimientos_stock
    ADD CONSTRAINT movimientos_stock_repuesto_id_fkey FOREIGN KEY (id_product)
    REFERENCES public.repuestos (id_product) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.movimientos_stock
    ADD CONSTRAINT movimientos_stock_usuario_id_fkey FOREIGN KEY (id_usuario)
    REFERENCES public.usuarios (id_usuario) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.repuestos
    ADD CONSTRAINT repuestos_categoria_id_fkey FOREIGN KEY (id_categoria)
    REFERENCES public.categorias (id_categoria) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.repuestos
    ADD CONSTRAINT repuestos_proveedor_id_fkey FOREIGN KEY (id_proveedor)
    REFERENCES public.proveedores (id_proveedor) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;