import { PrismaClient, UserRole, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando población de base de datos...');

  // Limpiar base de datos
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.auditLog.deleteMany();
  await prisma.emailJob.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.price.deleteMany();
  await prisma.priceList.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.factory.deleteMany();
  await prisma.organization.deleteMany();

  // Hash de contraseña para todos los usuarios (contraseña: "password123")
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ==================== CREAR ORGANIZACIONES ====================
  console.log('🏢 Creando organizaciones (clientes mayoristas)...');

  const org1 = await prisma.organization.create({
    data: {
      name: 'Distribuidora La Elegancia',
      code: 'ELEG001',
      email: 'ventas@yopmail.com',
      phone: '+52-55-1234-5678',
      address: 'Av. Reforma 123, Ciudad de México, CDMX',
      isActive: true,
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'Mayorista Fashion Point',
      code: 'FASHION001',
      email: 'pedidos@yopmail.com',
      phone: '+57-1-987-6543',
      address: 'Calle 72 #10-34, Bogotá, Colombia',
      isActive: true,
    },
  });

  const org3 = await prisma.organization.create({
    data: {
      name: 'Comercializadora El Buen Gusto',
      code: 'GUSTO001',
      email: 'compras@yopmail.com',
      phone: '+56-2-2345-6789',
      address: 'Av. Providencia 456, Santiago, Chile',
      isActive: true,
    },
  });

  const org4 = await prisma.organization.create({
    data: {
      name: 'Distribuciones Moderna',
      code: 'MODERNA001',
      email: 'info@yopmail.com',
      phone: '+54-11-4567-8901',
      address: 'Av. Santa Fe 789, Buenos Aires, Argentina',
      isActive: true,
    },
  });

  // ==================== CREAR FÁBRICAS ====================
  console.log('🏭 Creando fábricas de accesorios...');

  const factory1 = await prisma.factory.create({
    data: {
      name: 'Calzados Artesanales del Sur',
      code: 'FAC-CALZADO-SUR',
      contactEmail: 'ordenes@yopmail.com',
      contactPhone: '+52-33-8765-4321',
      address: 'Zona Industrial Norte, León, Guanajuato, México',
      isActive: true,
    },
  });

  const factory2 = await prisma.factory.create({
    data: {
      name: 'Marroquinería Premium',
      code: 'FAC-MARROQUIN',
      contactEmail: 'pedidos@yopmail.com',
      contactPhone: '+57-4-321-9876',
      address: 'Parque Industrial El Cuero, Medellín, Colombia',
      isActive: true,
    },
  });

  const factory3 = await prisma.factory.create({
    data: {
      name: 'Accesorios Fashion Ltda',
      code: 'FAC-ACCESORIOS',
      contactEmail: 'ventas@yopmail.com',
      contactPhone: '+51-1-567-8901',
      address: 'Av. Industrial 890, Lima, Perú',
      isActive: true,
    },
  });

  const factory4 = await prisma.factory.create({
    data: {
      name: 'Bolsos y Carteras Diseño Latino',
      code: 'FAC-BOLSOS-LAT',
      contactEmail: 'ordenes@yopmail.com',
      contactPhone: '+593-2-234-5678',
      address: 'Zona Franca Norte, Quito, Ecuador',
      isActive: true,
    },
  });

  // ==================== CREAR USUARIOS ====================
  console.log('👤 Creando usuarios...');

  // Usuario administrador
  const adminUser = await prisma.user.create({
    data: {
      email: 'adminvendora@yopmail.com',
      password: hashedPassword,
      firstName: 'Brian',
      lastName: 'Ortiz',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // Vendedores para cada organización
  const seller1 = await prisma.user.create({
    data: {
      email: 'maria.gonzalez@yopmail.com',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'González',
      role: UserRole.SELLER,
      organizationId: org1.id,
      isActive: true,
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'juan.rodriguez@yopmail.com',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Rodríguez',
      role: UserRole.SELLER,
      organizationId: org2.id,
      isActive: true,
    },
  });

  const seller3 = await prisma.user.create({
    data: {
      email: 'ana.martinez@yopmail.com',
      password: hashedPassword,
      firstName: 'Ana',
      lastName: 'Martínez',
      role: UserRole.SELLER,
      organizationId: org3.id,
      isActive: true,
    },
  });

  const seller4 = await prisma.user.create({
    data: {
      email: 'pedro.silva@yopmail.com',
      password: hashedPassword,
      firstName: 'Pedro',
      lastName: 'Silva',
      role: UserRole.SELLER,
      organizationId: org4.id,
      isActive: true,
    },
  });

  // Usuarios visualizadores de fábrica
  const factoryViewer1 = await prisma.user.create({
    data: {
      email: 'produccion@yopmail.com',
      password: hashedPassword,
      firstName: 'Laura',
      lastName: 'Hernández',
      role: UserRole.FACTORY_VIEWER,
      factoryId: factory1.id,
      isActive: true,
    },
  });

  const factoryViewer2 = await prisma.user.create({
    data: {
      email: 'supervisor@yopmail.com',
      password: hashedPassword,
      firstName: 'Roberto',
      lastName: 'Díaz',
      role: UserRole.FACTORY_VIEWER,
      factoryId: factory2.id,
      isActive: true,
    },
  });

  // ==================== CREAR PRODUCTOS Y VARIANTES ====================
  console.log('📦 Creando productos y variantes...');

  // ========== FÁBRICA 1: CALZADOS ==========

  // Producto 1: Zapatos de Mujer
  const producto1 = await prisma.product.create({
    data: {
      sku: 'ZAP-MUJ-TACON-001',
      name: 'Zapatos de Tacón Clásico',
      description: 'Elegantes zapatos de tacón en cuero genuino, perfectos para ocasiones formales',
      category: 'Calzado Mujer',
      tags: ['mujer', 'tacón', 'formal', 'cuero'],
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2',
      factoryId: factory1.id,
      isActive: true,
    },
  });

  const variante1_1 = await prisma.productVariant.create({
    data: {
      sku: 'ZAP-MUJ-TACON-001-NEGRO-36',
      name: 'Negro - Talla 36',
      color: 'Negro',
      size: '36',
      attributes: { material: 'Cuero Genuino', altura_tacon: '8cm', forro: 'Sintético' },
      imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2',
      stockCode: 'ZMT-N36',
      productId: producto1.id,
      isActive: true,
    },
  });

  const variante1_2 = await prisma.productVariant.create({
    data: {
      sku: 'ZAP-MUJ-TACON-001-NEGRO-37',
      name: 'Negro - Talla 37',
      color: 'Negro',
      size: '37',
      attributes: { material: 'Cuero Genuino', altura_tacon: '8cm', forro: 'Sintético' },
      stockCode: 'ZMT-N37',
      productId: producto1.id,
      isActive: true,
    },
  });

  const variante1_3 = await prisma.productVariant.create({
    data: {
      sku: 'ZAP-MUJ-TACON-001-ROJO-36',
      name: 'Rojo - Talla 36',
      color: 'Rojo',
      size: '36',
      attributes: { material: 'Cuero Genuino', altura_tacon: '8cm', forro: 'Sintético' },
      stockCode: 'ZMT-R36',
      productId: producto1.id,
      isActive: true,
    },
  });

  const variante1_4 = await prisma.productVariant.create({
    data: {
      sku: 'ZAP-MUJ-TACON-001-ROJO-38',
      name: 'Rojo - Talla 38',
      color: 'Rojo',
      size: '38',
      attributes: { material: 'Cuero Genuino', altura_tacon: '8cm', forro: 'Sintético' },
      stockCode: 'ZMT-R38',
      productId: producto1.id,
      isActive: true,
    },
  });

  // Producto 2: Botas Mujer
  const producto2 = await prisma.product.create({
    data: {
      sku: 'BOT-MUJ-001',
      name: 'Botas Largas de Invierno',
      description: 'Botas hasta la rodilla en cuero sintético, ideales para clima frío',
      category: 'Calzado Mujer',
      tags: ['mujer', 'botas', 'invierno', 'casual'],
      imageUrl: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329',
      factoryId: factory1.id,
      isActive: true,
    },
  });

  const variante2_1 = await prisma.productVariant.create({
    data: {
      sku: 'BOT-MUJ-001-NEGRO-37',
      name: 'Negro - Talla 37',
      color: 'Negro',
      size: '37',
      attributes: { material: 'Cuero Sintético', altura: 'Rodilla', cierre: 'Cremallera' },
      stockCode: 'BMI-N37',
      productId: producto2.id,
      isActive: true,
    },
  });

  const variante2_2 = await prisma.productVariant.create({
    data: {
      sku: 'BOT-MUJ-001-CAFE-38',
      name: 'Café - Talla 38',
      color: 'Café',
      size: '38',
      attributes: { material: 'Cuero Sintético', altura: 'Rodilla', cierre: 'Cremallera' },
      stockCode: 'BMI-C38',
      productId: producto2.id,
      isActive: true,
    },
  });

  // Producto 3: Zapatos Hombre
  const producto3 = await prisma.product.create({
    data: {
      sku: 'ZAP-HOM-VESTIR-001',
      name: 'Zapatos de Vestir Oxford',
      description: 'Zapatos clásicos tipo Oxford para caballero, perfectos para oficina',
      category: 'Calzado Hombre',
      tags: ['hombre', 'formal', 'oficina', 'cuero'],
      imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509',
      factoryId: factory1.id,
      isActive: true,
    },
  });

  const variante3_1 = await prisma.productVariant.create({
    data: {
      sku: 'ZAP-HOM-VESTIR-001-NEGRO-40',
      name: 'Negro - Talla 40',
      color: 'Negro',
      size: '40',
      attributes: { material: 'Cuero Genuino', tipo: 'Oxford', suela: 'Goma' },
      stockCode: 'ZHV-N40',
      productId: producto3.id,
      isActive: true,
    },
  });

  const variante3_2 = await prisma.productVariant.create({
    data: {
      sku: 'ZAP-HOM-VESTIR-001-CAFE-42',
      name: 'Café - Talla 42',
      color: 'Café',
      size: '42',
      attributes: { material: 'Cuero Genuino', tipo: 'Oxford', suela: 'Goma' },
      stockCode: 'ZHV-C42',
      productId: producto3.id,
      isActive: true,
    },
  });

  // ========== FÁBRICA 2: MARROQUINERÍA (BOLSOS Y CARTERAS) ==========

  // Producto 4: Bolso de Mano Mujer
  const producto4 = await prisma.product.create({
    data: {
      sku: 'BOL-MUJ-MANO-001',
      name: 'Bolso de Mano Elegante',
      description: 'Bolso de mano en cuero sintético con detalles metálicos dorados',
      category: 'Bolsos Mujer',
      tags: ['mujer', 'bolso', 'mano', 'elegante'],
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
      factoryId: factory2.id,
      isActive: true,
    },
  });

  const variante4_1 = await prisma.productVariant.create({
    data: {
      sku: 'BOL-MUJ-MANO-001-NEGRO',
      name: 'Negro',
      color: 'Negro',
      attributes: { material: 'Cuero Sintético', dimensiones: '30x25x12cm', compartimentos: 3 },
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
      stockCode: 'BMM-N',
      productId: producto4.id,
      isActive: true,
    },
  });

  const variante4_2 = await prisma.productVariant.create({
    data: {
      sku: 'BOL-MUJ-MANO-001-BEIGE',
      name: 'Beige',
      color: 'Beige',
      attributes: { material: 'Cuero Sintético', dimensiones: '30x25x12cm', compartimentos: 3 },
      stockCode: 'BMM-B',
      productId: producto4.id,
      isActive: true,
    },
  });

  const variante4_3 = await prisma.productVariant.create({
    data: {
      sku: 'BOL-MUJ-MANO-001-ROJO',
      name: 'Rojo Vino',
      color: 'Rojo Vino',
      attributes: { material: 'Cuero Sintético', dimensiones: '30x25x12cm', compartimentos: 3 },
      stockCode: 'BMM-RV',
      productId: producto4.id,
      isActive: true,
    },
  });

  // Producto 5: Mochila Urbana
  const producto5 = await prisma.product.create({
    data: {
      sku: 'MOCH-URB-001',
      name: 'Mochila Urbana Unisex',
      description: 'Mochila práctica para uso diario con compartimento para laptop',
      category: 'Mochilas',
      tags: ['unisex', 'mochila', 'urbana', 'laptop'],
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
      factoryId: factory2.id,
      isActive: true,
    },
  });

  const variante5_1 = await prisma.productVariant.create({
    data: {
      sku: 'MOCH-URB-001-NEGRO',
      name: 'Negro',
      color: 'Negro',
      attributes: { material: 'Nylon Resistente', laptop: '15 pulgadas', bolsillos: 5 },
      stockCode: 'MU-N',
      productId: producto5.id,
      isActive: true,
    },
  });

  const variante5_2 = await prisma.productVariant.create({
    data: {
      sku: 'MOCH-URB-001-GRIS',
      name: 'Gris',
      color: 'Gris',
      attributes: { material: 'Nylon Resistente', laptop: '15 pulgadas', bolsillos: 5 },
      stockCode: 'MU-G',
      productId: producto5.id,
      isActive: true,
    },
  });

  // Producto 6: Cartera Hombre
  const producto6 = await prisma.product.create({
    data: {
      sku: 'CART-HOM-001',
      name: 'Billetera Clásica de Cuero',
      description: 'Billetera bifold en cuero genuino con múltiples compartimentos',
      category: 'Carteras Hombre',
      tags: ['hombre', 'cartera', 'billetera', 'cuero'],
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93',
      factoryId: factory2.id,
      isActive: true,
    },
  });

  const variante6_1 = await prisma.productVariant.create({
    data: {
      sku: 'CART-HOM-001-NEGRO',
      name: 'Negro',
      color: 'Negro',
      attributes: { material: 'Cuero Genuino', tipo: 'Bifold', ranuras_tarjetas: 8 },
      stockCode: 'CH-N',
      productId: producto6.id,
      isActive: true,
    },
  });

  const variante6_2 = await prisma.productVariant.create({
    data: {
      sku: 'CART-HOM-001-CAFE',
      name: 'Café',
      color: 'Café',
      attributes: { material: 'Cuero Genuino', tipo: 'Bifold', ranuras_tarjetas: 8 },
      stockCode: 'CH-C',
      productId: producto6.id,
      isActive: true,
    },
  });

  // ========== FÁBRICA 3: ACCESORIOS ==========

  // Producto 7: Cinturón
  const producto7 = await prisma.product.create({
    data: {
      sku: 'CINT-UNI-001',
      name: 'Cinturón de Cuero Reversible',
      description: 'Cinturón reversible negro/café con hebilla clásica',
      category: 'Accesorios',
      tags: ['unisex', 'cinturón', 'cuero', 'reversible'],
      imageUrl: 'https://images.unsplash.com/photo-1624222247344-550fb60583c2',
      factoryId: factory3.id,
      isActive: true,
    },
  });

  const variante7_1 = await prisma.productVariant.create({
    data: {
      sku: 'CINT-UNI-001-32',
      name: 'Talla 32',
      size: '32',
      attributes: { material: 'Cuero Genuino', ancho: '3.5cm', reversible: true },
      stockCode: 'CU-32',
      productId: producto7.id,
      isActive: true,
    },
  });

  const variante7_2 = await prisma.productVariant.create({
    data: {
      sku: 'CINT-UNI-001-34',
      name: 'Talla 34',
      size: '34',
      attributes: { material: 'Cuero Genuino', ancho: '3.5cm', reversible: true },
      stockCode: 'CU-34',
      productId: producto7.id,
      isActive: true,
    },
  });

  // Producto 8: Gafas de Sol
  const producto8 = await prisma.product.create({
    data: {
      sku: 'GAF-SOL-001',
      name: 'Gafas de Sol Estilo Aviador',
      description: 'Lentes de sol con filtro UV400 y marco metálico',
      category: 'Accesorios',
      tags: ['unisex', 'gafas', 'sol', 'aviador'],
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
      factoryId: factory3.id,
      isActive: true,
    },
  });

  const variante8_1 = await prisma.productVariant.create({
    data: {
      sku: 'GAF-SOL-001-DORADO-NEGRO',
      name: 'Marco Dorado - Lente Negro',
      color: 'Dorado/Negro',
      attributes: { proteccion_uv: 'UV400', material_marco: 'Metal', polarizado: true },
      stockCode: 'GS-DN',
      productId: producto8.id,
      isActive: true,
    },
  });

  const variante8_2 = await prisma.productVariant.create({
    data: {
      sku: 'GAF-SOL-001-PLATA-VERDE',
      name: 'Marco Plateado - Lente Verde',
      color: 'Plateado/Verde',
      attributes: { proteccion_uv: 'UV400', material_marco: 'Metal', polarizado: true },
      stockCode: 'GS-PV',
      productId: producto8.id,
      isActive: true,
    },
  });

  // ========== FÁBRICA 4: BOLSOS Y CARTERAS DE DISEÑO ==========

  // Producto 9: Bolso Bandolera
  const producto9 = await prisma.product.create({
    data: {
      sku: 'BOL-BAND-001',
      name: 'Bolso Bandolera Crossbody',
      description: 'Bolso pequeño tipo crossbody ideal para salidas casuales',
      category: 'Bolsos Mujer',
      tags: ['mujer', 'bandolera', 'crossbody', 'casual'],
      imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7',
      factoryId: factory4.id,
      isActive: true,
    },
  });

  const variante9_1 = await prisma.productVariant.create({
    data: {
      sku: 'BOL-BAND-001-NEGRO',
      name: 'Negro',
      color: 'Negro',
      attributes: { material: 'Cuero Sintético', dimensiones: '20x15x8cm', correa_ajustable: true },
      stockCode: 'BB-N',
      productId: producto9.id,
      isActive: true,
    },
  });

  const variante9_2 = await prisma.productVariant.create({
    data: {
      sku: 'BOL-BAND-001-ROSA',
      name: 'Rosa',
      color: 'Rosa',
      attributes: { material: 'Cuero Sintético', dimensiones: '20x15x8cm', correa_ajustable: true },
      stockCode: 'BB-R',
      productId: producto9.id,
      isActive: true,
    },
  });

  // Producto 10: Cartera Mujer
  const producto10 = await prisma.product.create({
    data: {
      sku: 'CART-MUJ-001',
      name: 'Cartera Larga Bifold Mujer',
      description: 'Cartera larga con múltiples compartimentos y cierre de broche',
      category: 'Carteras Mujer',
      tags: ['mujer', 'cartera', 'billetera', 'largo'],
      imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3',
      factoryId: factory4.id,
      isActive: true,
    },
  });

  const variante10_1 = await prisma.productVariant.create({
    data: {
      sku: 'CART-MUJ-001-NEGRO',
      name: 'Negro',
      color: 'Negro',
      attributes: { material: 'Cuero Sintético', compartimentos: 12, cierre: 'Broche' },
      stockCode: 'CM-N',
      productId: producto10.id,
      isActive: true,
    },
  });

  const variante10_2 = await prisma.productVariant.create({
    data: {
      sku: 'CART-MUJ-001-ROJO',
      name: 'Rojo',
      color: 'Rojo',
      attributes: { material: 'Cuero Sintético', compartimentos: 12, cierre: 'Broche' },
      stockCode: 'CM-R',
      productId: producto10.id,
      isActive: true,
    },
  });

  // ==================== CREAR LISTAS DE PRECIOS ====================
  console.log('💰 Creando listas de precios...');

  const listaPrecio1 = await prisma.priceList.create({
    data: {
      name: 'Precios Mayoristas La Elegancia 2024',
      code: 'LP-ELEG-2024',
      description: 'Precios especiales para Distribuidora La Elegancia',
      validFrom: new Date('2024-01-01'),
      validTo: new Date('2024-12-31'),
      organizationId: org1.id,
      isActive: true,
    },
  });

  const listaPrecio2 = await prisma.priceList.create({
    data: {
      name: 'Precios Estándar Fashion Point',
      code: 'LP-FASHION-STD',
      description: 'Precios estándar para Fashion Point',
      validFrom: new Date('2024-01-01'),
      organizationId: org2.id,
      isActive: true,
    },
  });

  const listaPrecio3 = await prisma.priceList.create({
    data: {
      name: 'Lista General Mayorista 2024',
      code: 'LP-GENERAL-2024',
      description: 'Precios generales para todos los clientes',
      validFrom: new Date('2024-01-01'),
      isActive: true,
    },
  });

  // ==================== CREAR PRECIOS ====================
  console.log('💵 Asignando precios a productos...');

  // Precios para Lista 1 (La Elegancia) - Precios preferenciales
  await prisma.price.createMany({
    data: [
      // Zapatos de tacón
      { priceListId: listaPrecio1.id, variantId: variante1_1.id, amount: 450.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio1.id, variantId: variante1_2.id, amount: 450.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio1.id, variantId: variante1_3.id, amount: 450.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio1.id, variantId: variante1_4.id, amount: 450.00, currency: 'MXN', minQty: 1 },
      // Botas
      { priceListId: listaPrecio1.id, variantId: variante2_1.id, amount: 650.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio1.id, variantId: variante2_2.id, amount: 650.00, currency: 'MXN', minQty: 1 },
      // Zapatos hombre
      { priceListId: listaPrecio1.id, variantId: variante3_1.id, amount: 550.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio1.id, variantId: variante3_2.id, amount: 550.00, currency: 'MXN', minQty: 1 },
      // Bolsos de mano
      { priceListId: listaPrecio1.id, variantId: variante4_1.id, amount: 380.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio1.id, variantId: variante4_2.id, amount: 380.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio1.id, variantId: variante4_3.id, amount: 380.00, currency: 'MXN', minQty: 1 },
      // Mochilas
      { priceListId: listaPrecio1.id, variantId: variante5_1.id, amount: 420.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio1.id, variantId: variante5_2.id, amount: 420.00, currency: 'MXN', minQty: 1 },
      // Carteras hombre
      { priceListId: listaPrecio1.id, variantId: variante6_1.id, amount: 220.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio1.id, variantId: variante6_2.id, amount: 220.00, currency: 'MXN', minQty: 1 },
      // Cinturones
      { priceListId: listaPrecio1.id, variantId: variante7_1.id, amount: 180.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio1.id, variantId: variante7_2.id, amount: 180.00, currency: 'MXN', minQty: 1 },
      // Gafas
      { priceListId: listaPrecio1.id, variantId: variante8_1.id, amount: 250.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio1.id, variantId: variante8_2.id, amount: 250.00, currency: 'MXN', minQty: 1 },
      // Bandoleras
      { priceListId: listaPrecio1.id, variantId: variante9_1.id, amount: 320.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio1.id, variantId: variante9_2.id, amount: 320.00, currency: 'MXN', minQty: 1 },
      // Carteras mujer
      { priceListId: listaPrecio1.id, variantId: variante10_1.id, amount: 280.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio1.id, variantId: variante10_2.id, amount: 280.00, currency: 'MXN', minQty: 1 },
    ],
  });

  // Precios para Lista 2 (Fashion Point) - Precios estándar
  await prisma.price.createMany({
    data: [
      { priceListId: listaPrecio2.id, variantId: variante1_1.id, amount: 480.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante1_2.id, amount: 480.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante1_3.id, amount: 480.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante1_4.id, amount: 480.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante2_1.id, amount: 680.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante2_2.id, amount: 680.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante3_1.id, amount: 580.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante3_2.id, amount: 580.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante4_1.id, amount: 400.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante4_2.id, amount: 400.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante4_3.id, amount: 400.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante5_1.id, amount: 450.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante5_2.id, amount: 450.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante6_1.id, amount: 240.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante6_2.id, amount: 240.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante7_1.id, amount: 200.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante7_2.id, amount: 200.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante8_1.id, amount: 270.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante8_2.id, amount: 270.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante9_1.id, amount: 350.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante9_2.id, amount: 350.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante10_1.id, amount: 300.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio2.id, variantId: variante10_2.id, amount: 300.00, currency: 'MXN', minQty: 1 },
    ],
  });

  // Precios para Lista 3 (General) - Precio público mayorista
  await prisma.price.createMany({
    data: [
      { priceListId: listaPrecio3.id, variantId: variante1_1.id, amount: 500.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante1_2.id, amount: 500.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante1_3.id, amount: 500.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante1_4.id, amount: 500.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante2_1.id, amount: 700.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante2_2.id, amount: 700.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante3_1.id, amount: 600.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante3_2.id, amount: 600.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante4_1.id, amount: 420.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante4_2.id, amount: 420.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante4_3.id, amount: 420.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante5_1.id, amount: 480.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante5_2.id, amount: 480.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante6_1.id, amount: 260.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante6_2.id, amount: 260.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante7_1.id, amount: 220.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante7_2.id, amount: 220.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante8_1.id, amount: 290.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante8_2.id, amount: 290.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante9_1.id, amount: 370.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante9_2.id, amount: 370.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante10_1.id, amount: 320.00, currency: 'MXN', minQty: 1 },
      { priceListId: listaPrecio3.id, variantId: variante10_2.id, amount: 320.00, currency: 'MXN', minQty: 1 },
    ],
  });

  // ==================== CREAR ÓRDENES DE EJEMPLO ====================
  console.log('📋 Creando órdenes de ejemplo...');

  // Orden 1: Borrador
  const orden1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-00001',
      status: OrderStatus.DRAFT,
      notes: 'Primera orden de prueba - productos variados',
      totalAmount: 2700.00,
      currency: 'MXN',
      organizationId: org1.id,
      userId: seller1.id,
      factoryId: factory1.id,
      priceListId: listaPrecio1.id,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: orden1.id,
        variantId: variante1_1.id,
        quantity: 3,
        unitPrice: 450.00,
        totalPrice: 1350.00,
        notes: 'Zapatos de tacón negro para exhibición',
      },
      {
        orderId: orden1.id,
        variantId: variante1_3.id,
        quantity: 3,
        unitPrice: 450.00,
        totalPrice: 1350.00,
        notes: 'Zapatos de tacón rojo para exhibición',
      },
    ],
  });

  // Orden 2: Enviada
  const orden2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-00002',
      status: OrderStatus.SUBMITTED,
      notes: 'Pedido urgente para temporada',
      totalAmount: 3960.00,
      currency: 'MXN',
      organizationId: org2.id,
      userId: seller2.id,
      factoryId: factory2.id,
      priceListId: listaPrecio2.id,
      submittedAt: new Date(),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: orden2.id,
        variantId: variante4_1.id,
        quantity: 5,
        unitPrice: 400.00,
        totalPrice: 2000.00,
      },
      {
        orderId: orden2.id,
        variantId: variante4_2.id,
        quantity: 3,
        unitPrice: 400.00,
        totalPrice: 1200.00,
      },
      {
        orderId: orden2.id,
        variantId: variante6_1.id,
        quantity: 2,
        unitPrice: 240.00,
        totalPrice: 480.00,
      },
      {
        orderId: orden2.id,
        variantId: variante10_1.id,
        quantity: 1,
        unitPrice: 300.00,
        totalPrice: 300.00,
      },
    ],
  });

  // Orden 3: Accesorios mixtos
  const orden3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-00003',
      status: OrderStatus.DRAFT,
      notes: 'Surtido de accesorios para nueva tienda',
      totalAmount: 2840.00,
      currency: 'MXN',
      organizationId: org3.id,
      userId: seller3.id,
      factoryId: factory3.id,
      priceListId: listaPrecio3.id,
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: orden3.id,
        variantId: variante7_1.id,
        quantity: 10,
        unitPrice: 220.00,
        totalPrice: 2200.00,
      },
      {
        orderId: orden3.id,
        variantId: variante8_1.id,
        quantity: 2,
        unitPrice: 290.00,
        totalPrice: 580.00,
      },
    ],
  });

  // ==================== RESUMEN ====================
  console.log('\n✅ ¡Población de base de datos completada exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`   - Organizaciones: ${await prisma.organization.count()}`);
  console.log(`   - Fábricas: ${await prisma.factory.count()}`);
  console.log(`   - Usuarios: ${await prisma.user.count()}`);
  console.log(`   - Productos: ${await prisma.product.count()}`);
  console.log(`   - Variantes de Productos: ${await prisma.productVariant.count()}`);
  console.log(`   - Listas de Precios: ${await prisma.priceList.count()}`);
  console.log(`   - Precios: ${await prisma.price.count()}`);
  console.log(`   - Órdenes: ${await prisma.order.count()}`);
  console.log(`   - Items de Órdenes: ${await prisma.orderItem.count()}`);

  console.log('\n👤 Usuarios de Prueba (contraseña para todos: "password123"):');
  console.log('\n   🔑 ADMINISTRADOR:');
  console.log('      - adminvendora@yopmail.com (Brian Ortiz)');

  console.log('\n   💼 VENDEDORES:');
  console.log('      - maria.gonzalez@yopmail.com (Distribuidora La Elegancia)');
  console.log('      - juan.rodriguez@yopmail.com (Fashion Point)');
  console.log('      - ana.martinez@yopmail.com (El Buen Gusto)');
  console.log('      - pedro.silva@yopmail.com (Distribuciones Moderna)');

  console.log('\n   👁️  VISUALIZADORES DE FÁBRICA:');
  console.log('      - produccion@yopmail.com (Calzados del Sur)');
  console.log('      - supervisor@yopmail.com (Marroquinería Premium)');

  console.log('\n🏢 Organizaciones (Clientes Mayoristas):');
  console.log('   - Distribuidora La Elegancia (México)');
  console.log('   - Mayorista Fashion Point (Colombia)');
  console.log('   - Comercializadora El Buen Gusto (Chile)');
  console.log('   - Distribuciones Moderna (Argentina)');

  console.log('\n🏭 Fábricas:');
  console.log('   - Calzados Artesanales del Sur (Zapatos)');
  console.log('   - Marroquinería Premium (Bolsos y Carteras)');
  console.log('   - Accesorios Fashion Ltda (Accesorios Varios)');
  console.log('   - Bolsos y Carteras Diseño Latino (Bolsos Premium)');

  console.log('\n📦 Catálogo de Productos:');
  console.log('   - Zapatos de Tacón (múltiples colores y tallas)');
  console.log('   - Botas de Invierno');
  console.log('   - Zapatos de Vestir Hombre');
  console.log('   - Bolsos de Mano Elegantes');
  console.log('   - Mochilas Urbanas');
  console.log('   - Billeteras de Cuero');
  console.log('   - Cinturones Reversibles');
  console.log('   - Gafas de Sol');
  console.log('   - Bolsos Bandolera');
  console.log('   - Carteras Largas Mujer');

  console.log('\n💰 Moneda: MXN (Pesos Mexicanos)');
  console.log('\n🎉 ¡Listo para usar! Prueba iniciando sesión con cualquiera de los usuarios.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la población de base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
